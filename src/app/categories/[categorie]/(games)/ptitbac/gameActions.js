"use server";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  gamers,
  guests,
  multiGuests,
  //   options,
}) {
  if (gamers.length + guests.length + multiGuests.length < 2)
    return { error: "Un plus grand nombre de joueurs est requis." };

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

  const counts = gamersAndGuests.map((gamer) => ({
    name: gamer.name,
    points: 0,
    gold: 0,
  }));

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      phase: "waiting",
      themes: [],
      //   counts: [],
      counts,
      //   options,
    },
  });

  return {};
}

export async function startCountdown({ time, roomToken, gameData }) {
  const themes = await prisma.ptitbactheme.findMany({ take: 6 });
  const themeList = themes.map((theme) => theme.theme);
  const randomLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
    Math.floor(Math.random() * 26)
  ];
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "searching",
      themes: themeList,
      letter: randomLetter,
    },
  });
  setTimeout(async () => {
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        phase: "sending",
        themes: themeList,
      },
    });
  }, time);
}

export async function sendResponses({ roomId, responses, userId }) {
  const responsesStr = responses.join("/");

  await prisma.user.update({
    where: { id: userId },
    data: { ptitbacResponses: responsesStr },
  });

  //   const responsesArr = responsesStr.split("/");
}

export async function goValidation({ gamers, roomToken, gameData }) {
  const everyoneResponses = [];
  await Promise.all(
    gamers.map(async (gamer) => {
      const responses = (
        await prisma.user.findFirst({
          where: { id: gamer.id },
          select: { ptitbacResponses: true },
        })
      ).ptitbacResponses.split("/");
      everyoneResponses.push({ gamer: gamer.name, responses });
    })
  );
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "validating-0-0",
      everyoneResponses,
    },
  });
}

export async function vote({ vote, roomToken, gameData }) {
  const votes = gameData.votes || [];
  const counts = gameData.counts || [];
  const { phase, gamers } = gameData;
  let gamerIndex = parseInt(phase.split("-")[1]);
  const gamerName = gameData.everyoneResponses[gamerIndex].gamer;
  let responseIndex = parseInt(phase.split("-")[2]);

  votes.push(vote);
  const isLastVote = votes.length === gamers.length - 1;

  if (!isLastVote) {
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        votes,
      },
    });
  } else {
    let countGamerIndex = counts.findIndex((gamer) => gamer.name === gamerName);
    if (countGamerIndex === -1) countGamerIndex = counts.length;
    const countGamer = counts[countGamerIndex] || {
      name: gamerName,
      points: 0,
      gold: 0,
    };
    const affirmativeVotes = votes.reduce((trues, vote) => {
      return vote ? trues + 1 : trues;
    }, 0);
    const isAccepted = affirmativeVotes > (gamers.length - 1) / 2;
    if (isAccepted) countGamer.points += 1;
    const newCounts = [...counts];
    newCounts[countGamerIndex] = countGamer;
    responseIndex = responseIndex < 5 ? responseIndex + 1 : 0;
    gamerIndex = responseIndex === 0 ? gamerIndex + 1 : gamerIndex;
    if (gamerIndex !== gamers.length) {
      const nextPhase = `validating-${gamerIndex}-${responseIndex}`;
      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: {
          ...gameData,
          votes: [],
          counts: newCounts,
          phase: nextPhase,
        },
      });
    } else {
      const winnersIndexes = [];
      let maxPoints = 0;
      newCounts.map((gamerCount, i) => {
        if (gamerCount.points === maxPoints) winnersIndexes.push(i);
        else if (gamerCount.points > maxPoints) {
          winnersIndexes.splice(0, winnersIndexes.length, i);
          maxPoints = gamerCount.points;
        }
      });
      const newGoldsCount = [...newCounts];
      for (let i = 0; i < newGoldsCount.length; i++) {
        if (winnersIndexes.some((index) => index === i))
          newGoldsCount[i].gold += winnersIndexes.length > 1 ? 0.5 : 1;
        newGoldsCount[i].points = 0;
      }

      const isFinalWinners = newGoldsCount.some(
        (gamerCount) => gamerCount.gold >= 5
      );
      if (!isFinalWinners) {
        await pusher.trigger(`room-${roomToken}`, "room-event", {
          gameData: {
            ...gameData,
            votes: [],
            counts: newGoldsCount,
            phase: "waiting",
          },
        });
      } else {
        const finalWinners = newGoldsCount
          .filter((gamerCount) => gamerCount.gold >= 5)
          .map((winnerCount) => winnerCount.name);
        await pusher.trigger(`room-${roomToken}`, "room-event", {
          gameData: {
            ...gameData,
            counts: newGoldsCount,
            winners: finalWinners,
            phase: "ended",
            ended: true,
          },
        });
      }
    }
  }
}
