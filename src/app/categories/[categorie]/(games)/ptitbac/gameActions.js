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

  const { themes, random } = options;
  const miss = 6 - (themes.length + random);
  if (miss > 0)
    return {
      error: `Il te manque ${miss} catégorie${
        miss >= 2 ? "s" : ""
      } à sélectionner`,
    };

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

// LEGACY
// const getFreeThemes = async ({ gamers }) => {
//   const userIds = gamers.map((gamer) => gamer.id);

//   const alreadyThemes = await prisma.ptitbacthemesOnUsers.findMany({
//     where: { userId: { in: userIds } },
//     select: { ptitbacthemeId: true },
//   });
//   const alreadyThemesIds = [
//     ...new Set(alreadyThemes.map((theme) => theme.ptitbacthemeId)),
//   ];

//   let freeThemes = await prisma.ptitbactheme.findMany({
//     where: {
//       NOT: {
//         id: { in: alreadyThemesIds },
//       },
//     },
//     take: 6,
//   });
//   const freeThemesIds = [...new Set(freeThemes.map((free) => free.id))];

//   await Promise.all(
//     userIds.map(async (userId) => {
//       await Promise.all(
//         freeThemesIds.map(async (freeThemeId) => {
//           await prisma.ptitbacthemesOnUsers.create({
//             data: {
//               user: { connect: { id: userId } },
//               ptitbactheme: { connect: { id: freeThemeId } },
//             },
//           });
//         })
//       );
//     })
//   );

//   const missingThemes = 6 - freeThemesIds.length;
//   if (missingThemes !== 0) {
//     await prisma.ptitbacthemesOnUsers.deleteMany({
//       where: {
//         userId: { in: userIds },
//       },
//     });
//   }

//   const addedThemes = await prisma.ptitbactheme.findMany({
//     where: {
//       NOT: {
//         id: { in: freeThemesIds },
//       },
//     },
//     take: missingThemes,
//   });
//   const addedThemesIds = [...new Set(addedThemes.map((added) => added.id))];

//   await Promise.all(
//     userIds.map(async (userId) => {
//       await Promise.all(
//         addedThemesIds.map(async (addedThemeId) => {
//           await prisma.ptitbacthemesOnUsers.create({
//             data: {
//               user: { connect: { id: userId } },
//               ptitbactheme: { connect: { id: addedThemeId } },
//             },
//           });
//         })
//       );
//     })
//   );

//   const themes = [...freeThemes, ...addedThemes];
//   const themeList = themes.map((theme) => theme.theme);
//   return themeList;
// };

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
  const { newThemes, newStatusRandoms } = await getThemes({ gameData });
  const randomLetter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
    Math.floor(Math.random() * 26)
  ];
  const finishCountdownDate = Date.now() + time;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "searching",
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
  roomToken,
  gameData,
}) {
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
          phase: "sending",
        },
      });
    });
  } catch (error) {
    console.log("error", error);
  }
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
        validated: res.length >= 2 ? true : false,
      };
    });
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      alreadySent: 0,
      phase: "validating-0",
      themesResponses,
    },
  });
}

export async function refereeTrigger({
  newRefereeValidation,
  roomToken,
  gameData,
}) {
  const { phase, themesResponses, themes } = gameData;
  const valThemeIndex = parseInt(phase.split("-")[1]);
  const theme = themes[valThemeIndex];
  let newThemesResponses = { ...themesResponses };

  Object.values(newRefereeValidation).forEach((group) => {
    group.gamers.forEach((gamer) => {
      newThemesResponses[theme][gamer].validated = group.validated;
    });
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      themesResponses: newThemesResponses,
      refereeValidation: newRefereeValidation,
    },
  });
}

export async function validate({ roomToken, gameData }) {
  const { counts, themesResponses, phase, themes, options } = gameData;
  const valThemeIndex = parseInt(phase.split("-")[1]);
  const theme = themes[valThemeIndex];

  const newCounts = counts.map((count) => {
    const isAlone =
      Object.values(themesResponses[theme]).reduce(
        (times, response) =>
          response.word === themesResponses[theme][count.name].word
            ? times + 1
            : times,
        0
      ) === 1;
    return {
      ...count,
      gold: !themesResponses[theme][count.name].validated
        ? count.gold
        : isAlone
        ? count.gold + 2
        : count.gold + 1,
    };
  });

  const isLastTheme = valThemeIndex === themes.length - 1;

  if (!isLastTheme) {
    const nextPhase = `validating-${valThemeIndex + 1}`;
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
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

export async function manageEmptyTheme({ roomToken, gameData }) {
  const { phase, themes } = gameData;
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

export async function getAllThemes() {
  const allThemes = (await prisma.ptitbactheme.findMany({ where: {} }))
    .map((theme) => theme.theme)
    .sort((a, b) => a.localeCompare(b));
  return allThemes;
}
