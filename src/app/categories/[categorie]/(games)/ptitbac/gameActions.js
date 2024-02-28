"use server";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  gamers,
  guests,
  multiGuests,
  options,
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
      counts,
      options,
    },
  });

  return {};
}

const getFreeThemes = async ({ gamers }) => {
  const userIds = gamers.map((gamer) => gamer.id);

  const alreadyThemes = await prisma.ptitbacthemesOnUsers.findMany({
    where: { userId: { in: userIds } },
    select: { ptitbacthemeId: true },
  });
  const alreadyThemesIds = [
    ...new Set(alreadyThemes.map((theme) => theme.ptitbacthemeId)),
  ];

  let freeThemes = await prisma.ptitbactheme.findMany({
    where: {
      NOT: {
        id: { in: alreadyThemesIds },
      },
    },
    take: 6,
  });
  const freeThemesIds = [...new Set(freeThemes.map((free) => free.id))];

  await Promise.all(
    userIds.map(async (userId) => {
      await Promise.all(
        freeThemesIds.map(async (freeThemeId) => {
          await prisma.ptitbacthemesOnUsers.create({
            data: {
              user: { connect: { id: userId } },
              ptitbactheme: { connect: { id: freeThemeId } },
            },
          });
        })
      );
    })
  );

  const missingThemes = 6 - freeThemesIds.length;
  if (missingThemes !== 0) {
    await prisma.ptitbacthemesOnUsers.deleteMany({
      where: {
        userId: { in: userIds },
      },
    });
  }

  const addedThemes = await prisma.ptitbactheme.findMany({
    where: {
      NOT: {
        id: { in: freeThemesIds },
      },
    },
    take: missingThemes,
  });
  const addedThemesIds = [...new Set(addedThemes.map((added) => added.id))];

  await Promise.all(
    userIds.map(async (userId) => {
      await Promise.all(
        addedThemesIds.map(async (addedThemeId) => {
          await prisma.ptitbacthemesOnUsers.create({
            data: {
              user: { connect: { id: userId } },
              ptitbactheme: { connect: { id: addedThemeId } },
            },
          });
        })
      );
    })
  );

  const themes = [...freeThemes, ...addedThemes];
  const themeList = themes.map((theme) => theme.theme);
  return themeList;
};

export async function startCountdown({ time, roomToken, gameData }) {
  const themeList = await getFreeThemes({ gamers: gameData.gamers });
  const randomLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
    Math.floor(Math.random() * 26)
  ];
  const finishCountdownDate = Date.now() + time;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "searching",
      themes: themeList,
      letter: randomLetter,
      finishCountdownDate,
    },
  });
}

export async function sendResponses({
  responses,
  userId,
  roomToken,
  gameData,
}) {
  const responsesStr = responses.join("/");

  await prisma.user.update({
    where: { id: userId },
    data: { ptitbacResponses: responsesStr },
  });

  const alreadySent = gameData.alreadySent || 0;
  const newAlreadySent = alreadySent + 1;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      alreadySent: newAlreadySent,
      phase:
        newAlreadySent !== gameData.gamers.length ? "searching" : "sending",
    },
  });
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
      alreadySent: 0,
      phase: "validating-0-0",
      everyoneResponses,
    },
  });
}

export async function vote({ vote, roomToken, gameData }) {
  const votes = gameData.votes || [];
  votes.push(vote);
  const counts = gameData.counts || [];
  const { phase, gamers } = gameData;

  let gamerIndex = parseInt(phase.split("-")[1]);
  const gamerName = gameData.everyoneResponses[gamerIndex].gamer;
  let responseIndex = parseInt(phase.split("-")[2]);
  const isLastVote = votes.length === gamers.length - 1;

  if (!isLastVote) {
    // continue votes
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        votes,
      },
    });
  } else {
    // counting votes
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
      // next theme || next gamer
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
      // do the accounts
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
        // new turn
        await pusher.trigger(`room-${roomToken}`, "room-event", {
          gameData: {
            ...gameData,
            votes: [],
            counts: newGoldsCount,
            phase: "waiting",
          },
        });
      } else {
        // endgame
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
