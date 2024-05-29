"use server";

import prisma from "@/utils/prisma";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkPlayers from "@/utils/checkPlayers";
import { shuffleObject } from "@/utils/shuffleArray";

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
    gameName: "ptitbac",
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

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: startedRoom.gamers,
    guests,
    multiGuests,
  });

  const counts = gamersAndGuests.map((gamer) => ({
    name: gamer.name,
    // points: 0,
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

async function getThemes({ gameData }) {
  const { options } = gameData;
  const { themes } = options;

  const getRandoms = async () => {
    const allThemes = await getAllThemes();
    let newStatusRandoms;

    if (gameData.statusRandoms) {
      newStatusRandoms = { ...gameData.statusRandoms };
    } else {
      newStatusRandoms = {};
      allThemes.forEach((theme) => {
        newStatusRandoms[theme] = gameData.options.random;
      });
    }

    let newRandoms = [];
    const totalWeight = Object.values(newStatusRandoms).reduce(
      (acc, weight) => acc + weight,
      0
    );
    let randomNumber = gameData.options.random;
    const shuffledStatusRandoms = shuffleObject(newStatusRandoms);

    while (randomNumber > 0) {
      let cumulativeWeight = 0;
      let randomWeight = Math.random() * totalWeight;
      for (const [key, weight] of Object.entries(shuffledStatusRandoms)) {
        cumulativeWeight += weight;
        if (newRandoms.some((newRandom) => newRandom === key)) continue;
        if (randomWeight < cumulativeWeight) {
          newRandoms.push(key);
          randomNumber--;

          if (randomNumber === 0) break;
        }
      }
    }

    newRandoms.forEach((random) => {
      newStatusRandoms[random] =
        newStatusRandoms[random] !== 1
          ? newStatusRandoms[random] - 1
          : Math.floor(gameData.options.random / 2);
    });

    return { newRandoms, newStatusRandoms };
  };

  const { newRandoms, newStatusRandoms } = await getRandoms();
  const newThemes = [...themes, ...newRandoms];

  return { newThemes, newStatusRandoms };
}

export async function startCountdown({ time, roomToken, gameData }) {
  // const themeList = await getFreeThemes({ gamers: gameData.gamers });
  // const themeList = gameData.options.themes;
  const { newThemes, newStatusRandoms } = await getThemes({ gameData });
  const randomLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
    Math.floor(Math.random() * 26)
  ];
  const finishCountdownDate = Date.now() + time;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "searching",
      // themes: themeList,
      themes: newThemes,
      letter: randomLetter,
      finishCountdownDate,
      statusRandoms: newStatusRandoms,
    },
  });
}

export async function sendResponses({
  responses,
  userId,
  roomId,
  roomToken,
  gameData,
}) {
  console.log("responses", responses);
  console.log("userId", userId);
  console.log("roomId", roomId);
  console.log("roomToken", roomToken);
  console.log("gameData", gameData);
  try {
    await prisma.$transaction(async () => {
      const responsesStr = responses.join("/");

      await prisma.user.update({
        where: { id: userId },
        data: { ptitbacResponses: responsesStr },
      });

      // Legacy transaction example
      // const roomGameData =
      //   (
      //     await prisma.room.findUnique({
      //       where: { id: roomId },
      //       select: { gameData: true },
      //     })
      //   ).gameData || {};
      // const alreadySent =
      //   roomGameData?.alreadySent < gameData.gamers.length
      //     ? roomGameData.alreadySent
      //     : 0;
      // const newAlreadySent = alreadySent + 1;
      // const newRoomGameData = { ...roomGameData, alreadySent: newAlreadySent };
      // const TEST = await prisma.room.update({
      //   where: { id: roomId },
      //   data: { gameData: newRoomGameData },
      // });

      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: {
          ...gameData,
          // alreadySent: newAlreadySent,
          phase: "sending",
        },
      });
    });
  } catch (error) {
    console.log("error", error);
  }

  // const alreadySent = gameData.alreadySent || 0;
  // const newAlreadySent = alreadySent + 1;

  // await pusher.trigger(`room-${roomToken}`, "room-event", {
  //   gameData: {
  //     ...gameData,
  //     alreadySent: newAlreadySent,
  //     phase:
  //       newAlreadySent !== gameData.gamers.length ? "searching" : "sending",
  //   },
  // });
}

export async function goValidation({ gamers, roomToken, gameData }) {
  const { themes } = gameData;

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

  let themesResponses = {};
  themes.forEach((theme) => {
    themesResponses[theme] = {};
  });
  everyoneResponses.forEach((one) => {
    one.responses.forEach((res, index) => {
      themesResponses[themes[index]][one.gamer] = {
        word: res,
        validated: res.length >= 2 ? null : false,
      };
    });
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      alreadySent: 0,
      // phase: "validating-0-0",
      phase: "validating-0",
      // everyoneResponses,
      themesResponses,
    },
  });
}

export async function validate({ group, validation, roomToken, gameData }) {
  const { counts, phase, gamers, themesResponses, themes, options } = gameData;
  const valThemeIndex = parseInt(phase.split("-")[1]);
  const theme = themes[valThemeIndex];
  console.log("group", group);
  console.log("themesResponses", themesResponses);
  let newThemesResponses = { ...themesResponses };
  group.forEach((gamerRes) => {
    newThemesResponses = {
      ...newThemesResponses,
      [theme]: {
        ...newThemesResponses[theme],
        [gamerRes.gamer]: {
          ...newThemesResponses[theme][gamerRes.gamer],
          validated: validation,
        },
      },
    };
  });
  console.log("newThemesResponses", newThemesResponses);
  // const newThemesResponses = {
  //   ...themesResponses,
  //   [theme]: {
  //     ...themesResponses[theme],
  //     [gamerName]: {
  //       ...themesResponses[theme][gamerName],
  //       validated: validation,
  //     },
  //   },
  // };
  console.log("counts", counts);
  // const newCounts = counts.map((count) => {
  //   if (count.name === gamerName)
  //     return {
  //       name: gamerName,
  //       gold: validation ? count.gold + 1 : count.gold,
  //     };
  //   else return count;
  // });
  console.log("options", options);

  const newCounts = counts.map((count) => {
    if (group.some((gamerRes) => gamerRes.gamer === count.name))
      return {
        name: count.name,
        gold: validation
          ? count.gold + (group.length === 1 ? 2 : 1)
          : count.gold,
      };
    else return count;
  });
  console.log("newCounts", newCounts);

  const isLastWord = !Object.entries(newThemesResponses[theme]).some(
    (res) => res[1].validated === null
  );
  console.log("isLastWord", isLastWord);
  if (!isLastWord) {
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        themesResponses: newThemesResponses,
        counts: newCounts,
      },
    });
  } else {
    const isLastTheme = valThemeIndex === themes.length - 1;
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        themesResponses: newThemesResponses,
        counts: newCounts,
      },
    });
    console.log("isLastTheme", isLastTheme);
    if (!isLastTheme) {
      const nextPhase = `validating-${valThemeIndex + 1}`;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: {
          ...gameData,
          themesResponses: newThemesResponses,
          counts: newCounts,
          phase: nextPhase,
        },
      });
    } else {
      const { aimPoints } = options;
      const finalWinners = newCounts.filter(
        (gamerCount) => gamerCount.gold >= aimPoints
      );
      if (!finalWinners.length || aimPoints === 0) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await pusher.trigger(`room-${roomToken}`, "room-event", {
          gameData: {
            ...gameData,
            counts: newCounts,
            phase: "waiting",
          },
        });
      } else {
        await pusher.trigger(`room-${roomToken}`, "room-event", {
          gameData: {
            ...gameData,
            counts: newCounts,
            winners: finalWinners,
            phase: "ended",
            ended: true,
          },
        });
      }
    }
  }
}

export async function manageEmptyTheme({ roomToken, gameData }) {
  const { counts, phase, gamers, themesResponses, themes } = gameData;
  const valThemeIndex = parseInt(phase.split("-")[1]);
  const isLastTheme = valThemeIndex === themes.length - 1;
  const nextPhase = isLastTheme ? "waiting" : `validating-${valThemeIndex + 1}`;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: nextPhase,
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

export async function getAllThemes() {
  const allThemes = (await prisma.ptitbactheme.findMany({ where: {} }))
    .map((theme) => theme.theme)
    .sort((a, b) => a.localeCompare(b));
  return allThemes;
}
