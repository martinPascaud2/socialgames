"use server";

import prisma from "@/utils/prisma";

import { makeTeams, makeMinimalTeams } from "@/utils/makeTeams";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";

const getFreeWords = async ({ gamers }) => {
  const userIds = gamers.map((gamer) => gamer.id);

  const alreadyWords = await prisma.drawingWordsOnUsers.findMany({
    where: { userId: { in: userIds } },
    select: { drawingWordId: true },
  });
  const alreadyWordsIds = [
    ...new Set(alreadyWords.map((word) => word.drawingWordId)),
  ];

  let freeWords = await prisma.drawingWord.findMany({
    where: {
      NOT: {
        id: { in: alreadyWordsIds },
      },
    },
    take: gamers.length,
  });
  const freeWordsIds = [...new Set(freeWords.map((free) => free.id))];

  await Promise.all(
    userIds.map(async (userId) => {
      await Promise.all(
        freeWordsIds.map(async (freeWordId) => {
          await prisma.drawingWordsOnUsers.create({
            data: {
              user: { connect: { id: userId } },
              drawingWord: { connect: { id: freeWordId } },
            },
          });
        })
      );
    })
  );

  const missingWords = gamers.length - freeWordsIds.length;
  if (missingWords !== 0) {
    await prisma.drawingWordsOnUsers.deleteMany({
      where: {
        userId: { in: userIds },
      },
    });
  }

  const addedWords = await prisma.drawingWord.findMany({
    where: {
      NOT: {
        id: { in: freeWordsIds },
      },
    },
    take: missingWords,
  });
  const addedWordsIds = [...new Set(addedWords.map((added) => added.id))];

  await Promise.all(
    userIds.map(async (userId) => {
      await Promise.all(
        addedWordsIds.map(async (addedWordId) => {
          await prisma.drawingWordsOnUsers.create({
            data: {
              user: { connect: { id: userId } },
              drawingWord: { connect: { id: addedWordId } },
            },
          });
        })
      );
    })
  );

  const words = [...freeWords, ...addedWords];
  const wordList = words.map((word) => word.word);
  return wordList;
};

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  //   gamers,
  guests,
  multiGuests,
  options,
}) {
  const startedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      started: true,
    },
  });

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: startedRoom.gamers,
    guests,
    multiGuests,
  });

  const { error, teams } =
    options.teamMode === "teamNumber"
      ? makeTeams({
          gamersList: gamersAndGuests,
          teamsNumber: options.teamsNumber,
        })
      : makeMinimalTeams({
          gamersList: gamersAndGuests,
          minByTeam: options.minByTeam,
        });
  if (error) return { error };

  const activePlayers = Object.entries(teams).map((team) => ({
    ...team[1][0],
    team: team[0],
  }));

  const counts = {};
  Object.keys(teams).forEach(
    (teamKey) => (counts[teamKey] = { votes: [], points: 0 })
  );

  let words = [];
  if (options.mode === "chain") {
    const wordList = await getFreeWords({ gamers: gamersAndGuests });
    gamersAndGuests.map((gamer, i) => {
      words.push({
        word: wordList[i],
        DCuserID: gamer.multiGuest ? gamer.dataId : gamer.id,
        multiGuest: gamer.multiGuest,
      });
    });
  }
  // const isChainShow =
  //   options.mode === "chain" && gamersAndGuests.length % 2 === 1;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      gamers: gamersAndGuests,
      teams,
      counts,
      activePlayers,
      phase: "waiting",
      // phase: isChainShow ? "showing" : "waiting",
      // turn:
      //   options.mode === "chain" && gamersAndGuests.length % 2 === 1 ? 1 : 0,
      turn: 0,
      words,
      options,
    },
  });

  return {};
}

const getFreeWord = async ({ roomId }) => {
  const gamers = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gamers: true },
    })
  ).gamers;

  const userIds = Object.values(gamers);

  const alreadyWords = await prisma.drawingWordsOnUsers.findMany({
    where: { userId: { in: userIds } },
    select: { drawingWordId: true },
  });
  const alreadyWordsIds = [
    ...new Set(alreadyWords.map((word) => word.drawingWordId)),
  ];

  let freeWord = await prisma.drawingWord.findFirst({
    where: {
      NOT: {
        id: { in: alreadyWordsIds },
      },
    },
  });
  if (!freeWord) {
    await prisma.drawingWordsOnUsers.deleteMany({
      where: {
        userId: { in: userIds },
      },
    });
    freeWord = await prisma.drawingWord.findFirst({
      where: {},
    });
  }

  const freeWordId = freeWord.id;
  await Promise.all(
    userIds.map(async (userId) => {
      await prisma.drawingWordsOnUsers.create({
        data: {
          user: { connect: { id: userId } },
          drawingWord: { connect: { id: freeWordId } },
        },
      });
    })
  );

  return freeWord.word;
};

export async function startDrawing({ roomId, roomToken, gameData }) {
  const freeWord = await getFreeWord({ roomId });
  const finishCountdownDate = Date.now() + gameData.options.countDownTime;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "drawing",
      word: freeWord,
      finishCountdownDate,
    },
  });
}

export async function sendImage({ imgData, roomToken, gameData, user }) {
  if (user.multiGuest) {
    await prisma.multiguest.upsert({
      where: { id: user.dataId },
      update: { png: imgData },
      create: {
        id: user.dataId,
        png: imgData,
      },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { png: imgData },
    });
  }

  const alreadySent = gameData.alreadySent || 0;
  const newAlreadySent = alreadySent + 1;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      alreadySent: newAlreadySent,
      phase:
        newAlreadySent !== gameData.activePlayers.length &&
        gameData.phase !== "sending"
          ? "drawing"
          : "sending",
    },
  });
}

export async function getPng({ activePlayers, userTeam }) {
  const mate = activePlayers.find((active) => active.team === userTeam);
  let png;

  if (mate.multiGuest) {
    png = (
      await prisma.multiguest.findFirst({
        where: { id: mate.dataId },
        select: { png: true },
      })
    ).png;
  } else {
    png = (
      await prisma.user.findFirst({
        where: { id: mate.id },
        select: { png: true },
      })
    ).png;
  }

  return png;
}

export async function goSearch({ roomToken, gameData }) {
  const { activePlayers, teams } = gameData;
  const activeIds = activePlayers.map((active) => active.id);

  const newActivePlayers = Object.entries(teams)
    .map((team) => team[1].map((gamer) => ({ ...gamer, team: team[0] })))
    .flat()
    .filter((g) => !activeIds.some((id) => g.id === id));

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "searching",
      activePlayers: newActivePlayers,
      alreadySent: 0,
    },
  });
}

const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const formatWord = (guess) => {
  const lower = guess.toLowerCase();
  const trim = lower.trim();
  const noAccent = removeAccents(trim);

  return noAccent;
};

const compareWords = (word1, word2) => {
  const formatted1 = formatWord(word1);
  const formatted2 = formatWord(word2);

  if (formatted1 === formatted2) return true;
  return false;
};

const getNextDrawers = ({ teams, activePlayers }) => {
  const drawers = [];
  Object.entries(teams).forEach((team) => {
    const drawerIndex = team[1].findIndex(
      (mate) => !activePlayers.some((active) => active.id === mate.id)
    );
    const drawer = { team: team[0], index: drawerIndex };
    drawers.push(drawer);
  });

  const nextDrawers = [];
  drawers.forEach((drawer) => {
    const nextDrawerIndex = (drawer.index + 1) % teams[drawer.team].length;
    const nextDrawer = {
      ...teams[drawer.team][nextDrawerIndex],
      team: drawer.team,
    };
    nextDrawers.push(nextDrawer);
  });

  return nextDrawers;
};

export async function guessWord(
  userTeam,
  gameData,
  roomToken,
  prevState,
  formData
) {
  const guess = formData.get("guess");
  const { activePlayers, word, teams, counts } = gameData;
  const teamCount = counts[userTeam];
  const isRightAnswer = compareWords(guess, word);

  const newVotes = [...teamCount.votes, isRightAnswer ? true : false];
  const newTeamCount = { ...teamCount, votes: newVotes };

  if (newVotes.length === gameData.teams[userTeam].length - 1) {
    const isPoint = newVotes.some((vote) => vote);
    const newPoints = isPoint ? teamCount.points + 1 : teamCount.points;
    newTeamCount.points = newPoints;
  }

  let newCounts = { ...counts, [userTeam]: newTeamCount };

  let nextPhase =
    Object.values(newCounts).reduce(
      (total, { votes }) => total + votes.length,
      0
    ) ===
    Object.values(teams).reduce((acc, team) => acc + team.length, 0) -
      Object.keys(teams).length
      ? "waiting"
      : "searching";

  let newActivePlayers = [];
  let winners = [];
  if (nextPhase === "waiting") {
    Object.entries(newCounts).forEach(
      (count) => (newCounts[count[0]].votes = [])
    );
    newActivePlayers = getNextDrawers({ teams, activePlayers });

    const aimPoints = gameData.options.aimPoints;
    const winnerTeams = Object.entries(newCounts)
      .filter((count) => count[1].points === aimPoints)
      .map((winner) => winner[0]);
    winners = winnerTeams.map((team) => teams[team]).flat();
    if (winners.length) nextPhase = "ended";
  } else {
    newActivePlayers = activePlayers;
  }

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: nextPhase,
      counts: newCounts,
      activePlayers: newActivePlayers,
      lastWord: word, //only used in waiting phase
      winners,
      ended: nextPhase === "ended",
    },
  });
}

export async function goNextPhase({ roomToken, gameData, full = false }) {
  const { phase, gamers, turn } = gameData;
  let newFinishCountdownDate = gameData.finishCountdownDate;
  let nextPhase = "";
  let validated;
  let newTurn = turn;
  let nextShowedLink;

  switch (phase) {
    case "waiting":
      validated = (gameData.validated || 0) + 1;
      if (validated === gamers.length || full) {
        nextPhase = "drawing";
        validated = 0;
        newTurn += 1;
        newFinishCountdownDate = Date.now() + gameData.options.countDownTime;
      } else {
        nextPhase = "waiting";
      }
      break;
    case "drawing":
      validated = gameData.validated + 1;
      if (validated === gamers.length || full) {
        nextPhase = "guessing";
        validated = 0;
        newTurn += 1;
      } else {
        nextPhase = "drawing";
      }
      break;
    case "guessing":
      validated = gameData.validated + 1;
      if (validated === gamers.length || full) {
        const even = gamers.length % 2 === 0 ? 1 : 0;
        newTurn += 1;
        if (newTurn === gamers.length + even) {
          nextPhase = "showing-0-1";
        } else {
          nextPhase = "drawing";
          validated = 0;
          newFinishCountdownDate = Date.now() + gameData.options.countDownTime;
        }
      } else {
        nextPhase = "guessing";
      }
      break;
    default:
  }

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: nextPhase,
      validated,
      turn: newTurn,
      finishCountdownDate: newFinishCountdownDate,
      nextShowedLink,
    },
  });
}

export async function initChain({ userName, chainRef }) {
  const { word, DCuserID, multiGuest } = chainRef;

  if (!multiGuest) {
    await prisma.user.update({
      where: { id: DCuserID },
      data: {
        drawChain: { deleteMany: {} },
      },
    });

    await prisma.user.update({
      where: { id: DCuserID },
      data: {
        drawChain: {
          create: [
            {
              userName,
              data: word,
              type: "word",
            },
          ],
        },
      },
    });
  } else {
    await prisma.multiguest.update({
      where: { id: DCuserID },
      data: {
        drawChain: { deleteMany: {} },
      },
    });

    await prisma.multiGuest.update({
      where: { id: DCuserID },
      data: {
        drawChain: {
          create: [
            {
              userName,
              data: word,
              type: "word",
            },
          ],
        },
      },
    });
  }
}

export async function addLink({
  userName,
  chainRef,
  data,
  type,
  roomToken,
  gameData,
}) {
  const { DCuserID, multiGuest } = chainRef;

  if (!multiGuest) {
    await prisma.user.update({
      where: { id: DCuserID },
      data: {
        drawChain: {
          create: {
            userName,
            data,
            type,
          },
        },
      },
    });
  } else {
    await prisma.multiGuest.update({
      where: { id: DCuserID },
      data: {
        drawChain: {
          create: {
            userName,
            data,
            type,
          },
        },
      },
    });
  }

  await goNextPhase({ roomToken, gameData });
}

export async function getLastLink({ chainRef }) {
  let lastDrawLink;

  if (!chainRef.multiGuest) {
    lastDrawLink = await prisma.user.findUnique({
      where: { id: chainRef.DCuserID },
      select: {
        drawChain: {
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });
  } else {
    lastDrawLink = await prisma.multiguest.findUnique({
      where: { id: chainRef.DCuserID },
      select: {
        drawChain: {
          orderBy: { id: "desc" },
          take: 1,
        },
      },
    });
  }

  return lastDrawLink.drawChain[0];
}

export async function goNextShow({ roomToken, gameData }) {
  const { phase, gamers } = gameData;
  let nextPhase;
  let [, gamerIndex, showedIndex] = phase
    .split("-")
    .map((index) => parseInt(index));
  const even = gamers.length % 2 === 0 ? 1 : 0;

  if (showedIndex === 0) {
    gamerIndex += 1;
    showedIndex = 1;
  } else {
    showedIndex += 1;
    if (showedIndex === gamers.length + even) {
      showedIndex = 0;
    }
  }

  if (gamerIndex > gamers.length - 1) {
    nextPhase = "ended";
  } else {
    nextPhase = `showing-${gamerIndex}-${showedIndex}`;
  }

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: nextPhase,
      ended: nextPhase === "ended",
    },
  });
}

export async function getNextLink({ shower, showedLinkIndex }) {
  let newLink;

  if (!shower.multiGuest) {
    newLink = (
      await prisma.user.findUnique({
        where: {
          id: shower.DCuserID,
        },
        select: {
          drawChain: {
            skip: showedLinkIndex,
            take: 1,
          },
        },
      })
    ).drawChain[0];
  } else {
    newLink = (
      await prisma.multiguest.findUnique({
        where: {
          id: shower.DCuserID,
        },
        select: {
          drawChain: {
            skip: showedLinkIndex,
            take: 1,
          },
        },
      })
    ).drawChain[0];
  }

  return newLink;
}
