"use server";

import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";

import { saveAndDispatchData } from "@/components/Room/actions";

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
    gameName: "socialknowledge",
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
  const { newViceAdmin: viceAdmin, arrivalsOrder } =
    await checkViceAdminAndArrivals({
      roomId,
      admin: startedRoom.admin,
      viceAdmin: startedRoom.viceAdmin,
      gamersAndGuests,
    });

  let newData;

  if (options.mode === "Tableau") {
    newData = {
      admin: startedRoom.admin,
      viceAdmin,
      arrivalsOrder,
      gamers: gamersAndGuests,
      // activePlayer: gamersAndGuests[0],
      enhanced: [],
      randoms: [],
      options,
      phase: "waiting",
    };
  }

  await saveAndDispatchData({ roomId, roomToken, newData });
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

const deleteAllTableauResponse = async ({ gamers }) => {
  await Promise.all(
    gamers.map(async (gamer) => {
      if (!gamer.multiGuest) {
        await prisma.tableauResponse.deleteMany({
          where: { userId: gamer.id },
        });
      } else {
        await prisma.tableauResponse.deleteMany({
          where: { multiguestId: gamer.dataId },
        });
      }
    })
  );
};

export async function startGame({ gameData, roomId, roomToken }) {
  const { options, gamers } = gameData;
  const { themes, randoms: randomsNumber } = options;

  await deleteAllTableauResponse({ gamers });

  let enhanced = [];
  let onlySelected = [];
  let randoms = [];

  themes.forEach((theme) => {
    if (theme.enhanced) enhanced.push(theme.theme);
    else if (theme.selected) onlySelected.push(theme.theme);
  });
  let selectedRandomIndexes = new Set();
  while (selectedRandomIndexes.size < randomsNumber) {
    const randomIndex = Math.floor(Math.random() * onlySelected.length);
    selectedRandomIndexes.add(randomIndex);
  }
  selectedRandomIndexes = Array.from(selectedRandomIndexes);
  selectedRandomIndexes.forEach((randomIndex) => {
    randoms.push(onlySelected[randomIndex]);
  });

  const newData = { ...gameData, phase: "writing", enhanced, randoms };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function sendResponse({
  theme,
  response,
  gameData,
  roomId,
  roomToken,
  user,
  isLast,
}) {
  if (!user.multiGuest) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        tableauResponses: {
          create: {
            theme: theme,
            response: response,
          },
        },
      },
    });
  } else {
    await prisma.multiguest.upsert({
      where: { id: user.dataId },
      update: {
        tableauResponses: {
          create: {
            theme: theme,
            response: response,
          },
        },
      },
      create: {
        id: user.dataId,
        tableauResponses: {
          create: {
            theme: theme,
            response: response,
          },
        },
      },
    });
  }

  if (isLast) {
    const { gamers, enhanced, randoms } = gameData;
    const themesNumber = enhanced.length + randoms.length;
    let responsesGamerCounts = [];

    await Promise.all(
      gamers.map(async (gamer) => {
        if (!gamer.multiGuest) {
          const count = await prisma.tableauResponse.count({
            where: {
              userId: gamer.id,
            },
          });
          responsesGamerCounts.push(count);
        } else {
          const count = await prisma.tableauResponse.count({
            where: {
              multiguestId: gamer.dataId,
            },
          });
          responsesGamerCounts.push(count);
        }
      })
    );

    if (responsesGamerCounts.every((count) => count === themesNumber)) {
      let allResponsesByUser = {};

      await Promise.all(
        gamers.map(async (gamer) => {
          let tableauResponses;
          if (!gamer.multiGuest) {
            tableauResponses = (
              await prisma.user.findFirst({
                where: { id: gamer.id },
                select: { tableauResponses: true },
              })
            ).tableauResponses;
          } else {
            tableauResponses = (
              await prisma.multiguest.findFirst({
                where: { id: gamer.dataId },
                select: { tableauResponses: true },
              })
            ).tableauResponses;
          }

          let gamerResponses = {};
          tableauResponses.forEach(
            (response) => (gamerResponses[response.theme] = response.response)
          );
          allResponsesByUser[gamer.name] = gamerResponses;
        })
      );

      const allResponsesByTheme = {};
      const gamersNames = [];
      for (const [user, themes] of Object.entries(allResponsesByUser)) {
        gamersNames.push(user);
        for (const [theme, response] of Object.entries(themes)) {
          if (!allResponsesByTheme[theme]) {
            allResponsesByTheme[theme] = {};
          }
          allResponsesByTheme[theme][user] = response;
        }
      }

      gamersNames.sort();

      const newData = {
        ...gameData,
        allResponses: allResponsesByTheme,
        gamersNames,
        phase: "sorting",
      };
      await saveAndDispatchData({ roomId, roomToken, newData });
    }
  }
}

export async function writtingComeBack({ user }) {
  if (!user.multiGuest) {
    const writtenIndex = await prisma.tableauResponse.count({
      where: {
        userId: user.id,
      },
    });
    return writtenIndex;
  } else {
    const writtenIndex = await prisma.tableauResponse.count({
      where: {
        multiguestId: user.dataId,
      },
    });
    return writtenIndex;
  }
}

export async function removeTableauGamers({
  roomId,
  roomToken,
  gameData,
  onlineGamers,
  admins,
  arrivalsOrder,
}) {
  const { gamers } = gameData;

  const onlineGamersList = onlineGamers.map((gamer) => gamer.userName);
  const onlineGamersSet = new Set(onlineGamersList);

  const remainingGamers = gamers.filter((gamer) =>
    onlineGamersSet.has(gamer.name)
  );

  const newData = {
    ...gameData,
    gamers: remainingGamers,
    //   isDeletedUser: true,
    admin: admins.newAdmin,
    viceAdmin: admins.newViceAdmin,
    arrivalsOrder,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
