"use server";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkPlayers from "@/utils/checkPlayers";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  gamers,
  guests,
  multiGuests,
  options,
}) {
  const { error: playersError } = checkPlayers({
    gameName: "undercover",
    gamers,
    guests,
    multiGuests,
  });
  if (playersError) return { error: playersError };

  const startedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      started: true,
    },
  });

  const getFreeTheme = async () => {
    const userIds = Object.values(startedRoom.gamers);

    const alreadyThemes = await prisma.undercoverthemesOnUsers.findMany({
      where: { userId: { in: userIds } },
      select: { undercoverthemeId: true },
    });
    const alreadyThemesIds = [
      ...new Set(alreadyThemes.map((theme) => theme.undercoverthemeId)),
    ];

    let freeThemes = await prisma.undercovertheme.findMany({
      where: {
        NOT: {
          id: { in: alreadyThemesIds },
        },
      },
      include: {
        words: true,
      },
    });
    if (!freeThemes.length) {
      await prisma.undercoverthemesOnUsers.deleteMany({
        where: {
          userId: { in: userIds },
        },
      });
      freeThemes = await prisma.undercovertheme.findMany({
        where: {},
        include: {
          words: true,
        },
      });
    }

    const randomTheme =
      freeThemes[Math.floor(Math.random() * freeThemes.length)];
    await Promise.all(
      userIds.map(async (userId) => {
        await prisma.UndercoverthemesOnUsers.create({
          data: {
            user: { connect: { id: userId } },
            undercovertheme: { connect: { id: randomTheme.id } },
          },
        });
      })
    );

    return randomTheme;
  };
  const theme = await getFreeTheme();

  const getWords = (theme) => {
    const { words: wordList } = theme;

    const fakeWord = wordList[Math.floor(Math.random() * wordList.length)].word;
    let trueWord = wordList[Math.floor(Math.random() * wordList.length)].word;
    while (trueWord === fakeWord) {
      trueWord = wordList[Math.floor(Math.random() * wordList.length)].word;
    }

    return { fakeWord, trueWord };
  };
  const words = getWords(theme);

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: startedRoom.gamers,
    guests,
    multiGuests,
  });

  const whiteNumber = gamersAndGuests.length > 3 ? 1 : 0;
  const assignWhite = () => {
    const randomWhiteIndex = Math.floor(Math.random() * gamersAndGuests.length);
    gamersAndGuests[randomWhiteIndex].role = "white";
    gamersAndGuests[randomWhiteIndex].word = "Vous êtes mister White !";
  };
  whiteNumber && assignWhite();

  const undercoverNumber = Math.floor(gamersAndGuests.length / 3);
  const assignUndercovers = () => {
    for (let i = undercoverNumber; i > 0; i--) {
      let randomUndercoverIndex = Math.floor(
        Math.random() * gamersAndGuests.length
      );
      while (
        gamersAndGuests[randomUndercoverIndex].role === "white" ||
        gamersAndGuests[randomUndercoverIndex].role === "undercover"
      ) {
        randomUndercoverIndex = Math.floor(
          Math.random() * gamersAndGuests.length
        );
      }
      gamersAndGuests[randomUndercoverIndex].role = "undercover";
      gamersAndGuests[randomUndercoverIndex].word = words.fakeWord;
    }
  };
  assignUndercovers();

  gamersAndGuests.map((gamer, i) => {
    if (gamer.role !== "white" && gamer.role !== "undercover") {
      gamersAndGuests[i].role = "civil";
      gamersAndGuests[i].word = words.trueWord;
    }
    gamersAndGuests[i].alive = true;
  });

  const assignGoddess = () => {
    const randomGoddessIndex = Math.floor(
      Math.random() * gamersAndGuests.length
    );
    gamersAndGuests.map((gamer, i) => {
      if (i === randomGoddessIndex) gamersAndGuests[i].goddess = true;
      else gamersAndGuests[i].goddess = false;
    });
  };
  assignGoddess();

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      phase: "reveal",
      votes: {},
      deadMen: [],
    },
  });

  return {};
}

export async function launchDescriptions({ gameData, roomToken }) {
  const newData = {
    ...gameData,
    phase: "description",
  };

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}

export async function getNextGamer(gameData, roomToken) {
  const { gamers: gamerList, activePlayer } = gameData;
  const index = gamerList.findIndex(
    (gamer) => gamer.name === activePlayer.name
  );
  let nextGamer;
  let phase;
  let nextIndex = index + 1;

  while (nextIndex !== gamerList.length) {
    if (gamerList[nextIndex].alive) {
      phase = "description";
      nextGamer = gamerList[nextIndex];
      break;
    }
    nextIndex++;
  }

  if (!nextGamer) {
    phase = "vote";
    nextGamer = gamerList[0];
  }

  const newData = {
    ...gameData,
    phase,
    activePlayer: nextGamer,
  };

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}

const checkEnd = (newData, deadIndex) => {
  let checkedData = { ...newData };
  if (checkedData.gamers[deadIndex].role === "white") {
    checkedData = { ...checkedData, phase: "white" };
  } else {
    const onlyCivils = checkedData.gamers
      .filter((gamer) => gamer.alive)
      .every((alive) => alive.role === "civil");
    if (onlyCivils) checkedData = { ...checkedData, phase: "civilsWin" };

    let civilsRemain = 0;
    checkedData.gamers.map((gamer) => {
      civilsRemain =
        gamer.role === "civil" && gamer.alive ? civilsRemain + 1 : civilsRemain;
    });

    if (civilsRemain === 1) {
      const whiteAlive = checkedData.gamers.find(
        (gamer) => gamer.role === "white"
      )?.alive;
      checkedData = {
        ...checkedData,
        phase: whiteAlive ? "undercoversWinMaybeWhite" : "undercoversWin",
      };
    }
  }
  return checkedData;
};

export async function voteAgainst(gameData, roomToken, gamerName) {
  const { votes, gamers } = gameData;

  const stillAlive = gamers.reduce((count, gamer) => {
    return gamer.alive ? count + 1 : count;
  }, 0);
  const newVotes = { ...votes };
  newVotes[gamerName] = newVotes[gamerName] ? newVotes[gamerName] + 1 : 1;

  const isEveryoneVoted =
    Object.values(newVotes).reduce((acc, num) => {
      return acc + num;
    }, 0) === stillAlive;

  if (isEveryoneVoted) {
    let maxVotes = 0;
    Object.values(newVotes).forEach((vote) => {
      if (vote > maxVotes) maxVotes = vote;
    });

    const deadMen = Object.keys(newVotes).filter(
      (selected) => newVotes[selected] === maxVotes
    );

    if (deadMen.length === 1) {
      let newData = {
        ...gameData,
        phase: "description",
        votes: [],
      };

      const deadIndex = gamers.findIndex((gamer) => deadMen[0] === gamer.name);
      newData.gamers[deadIndex].alive = false;
      newData.activePlayer = newData.gamers.find((gamer) => gamer.alive);

      newData = checkEnd(newData, deadIndex);

      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: newData,
      });
    }

    if (deadMen.length > 1) {
      const newData = { ...gameData, phase: "goddess", deadMen };
      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: newData,
      });
    }
  } else {
    const newData = {
      ...gameData,
      votes: newVotes,
      phase: "vote",
    };

    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: newData,
    });
  }
}

export async function goddessVote(gameData, roomToken, gamerName) {
  let newData = {
    ...gameData,
    phase: "description",
    votes: [],
  };

  const deadIndex = gameData.gamers.findIndex(
    (gamer) => gamerName === gamer.name
  );
  newData.gamers[deadIndex].alive = false;
  newData.activePlayer = newData.gamers.find((gamer) => gamer.alive);

  newData = checkEnd(newData, deadIndex);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}

export async function whiteGuess(gameData, roomToken, prevState, formData) {
  const guess = formData.get("guess");
  const trueWord = gameData.gamers.find((gamer) => gamer.role === "civil").word;

  if (trueWord.toUpperCase() === guess.toUpperCase()) {
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        phase:
          gameData.phase === "undercoversWinMaybeWhite"
            ? "undercoversWinWithWhite"
            : "whiteWin",
      },
    });
  } else {
    const stillUndercover = !!gameData.gamers
      .filter((gamer) => gamer.alive)
      .find((alive) => alive.role === "undercover");

    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        phase:
          gameData.phase === "undercoversWinMaybeWhite"
            ? "undercoversWin"
            : stillUndercover
            ? "description"
            : "civilsWin",
        votes: [],
      },
    });
  }

  return { message: null };
}
