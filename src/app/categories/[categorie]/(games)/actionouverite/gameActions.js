"use server";

import prisma from "@/utils/prisma";
import pusher from "@/utils/pusher";

export async function launchGame(roomId, roomToken, gamers, options) {
  const startedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      started: true,
    },
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      activePlayer: gamers[0].id,
      gamers,
      card: 0,
    },
  });
}

const getNextGamer = (gamerList, gamerId) => {
  const index = gamerList.findIndex((gamer) => gamer.id === gamerId);
  const nextIndex = (index + 1) % gamerList.length;
  const nextGamer = gamerList[nextIndex].id;
  return nextGamer;
};

export async function triggerGameEvent(roomId, roomToken, gameData, choice) {
  let actionRemain;
  let veriteRemain;
  let actionSecond = gameData?.secondRemain?.action || [];
  let veriteSecond = gameData?.secondRemain?.verite || [];

  // console.log("gameData.remain.actionRemain", gameData.remain.actionRemain);
  // console.log("gameData.remain.veriteRemain", gameData.remain.veriteRemain);
  // console.log("gameData.secondRemain.action", gameData.secondRemain.action);
  // console.log("gameData.secondRemain.verite", gameData.secondRemain.verite);

  if (!gameData.remain) {
    actionRemain = (
      await prisma.actionouverite.findMany({
        where: {
          type: "action",
        },
        select: {
          id: true,
        },
      })
    ).map((card) => card.id);

    veriteRemain = (
      await prisma.actionouverite.findMany({
        where: {
          type: "vérité",
        },
        select: {
          id: true,
        },
      })
    ).map((card) => card.id);

    const allAlreadyUnflat = [];
    await Promise.all(
      gameData.gamers.map(async (gamer) => {
        const gamerAlready =
          (
            await prisma.user.findFirst({
              where: {
                id: gamer.id,
              },
              select: {
                alreadyActionouverite: true,
              },
            })
          )?.alreadyActionouverite?.idList || [];
        allAlreadyUnflat.push(gamerAlready);
      })
    );
    const allAlreadyFlat = allAlreadyUnflat.flat();

    const actionRemainSET = new Set(actionRemain);
    const veriteRemainSET = new Set(veriteRemain);
    const actionSecondSET = new Set(actionRemain);
    const veriteSecondSET = new Set(veriteRemain);

    allAlreadyFlat.map((already) => {
      actionRemainSET.delete(already);
      veriteRemainSET.delete(already);
    });
    actionRemain = [...actionRemainSET];
    veriteRemain = [...veriteRemainSET];

    actionRemain.map((action) => {
      actionSecondSET.delete(action);
    });
    veriteRemain.map((verite) => {
      veriteSecondSET.delete(verite);
    });
    actionSecond = [...actionSecondSET];
    veriteSecond = [...veriteSecondSET];
  } else {
    actionRemain = gameData.remain.actionRemain;
    veriteRemain = gameData.remain.veriteRemain;
  }

  const newActivePlayer = getNextGamer(gameData.gamers, gameData.activePlayer);

  const choicedList = choice === "action" ? actionRemain : veriteRemain;
  const randomIndex =
    choicedList[Math.floor(Math.random() * choicedList.length)];
  const randomCard = await prisma.actionouverite.findFirst({
    where: {
      id: randomIndex,
    },
  });

  await Promise.all(
    gameData.gamers.map(async (gamer) => {
      const oldAlready =
        (
          await prisma.user.findFirst({
            where: {
              id: gamer.id,
            },
            select: {
              alreadyActionouverite: true,
            },
          })
        )?.alreadyActionouverite?.idList || [];

      const newAlready = [...oldAlready, randomCard.id];

      await prisma.user.update({
        where: {
          id: gamer.id,
        },
        data: {
          alreadyActionouverite: { idList: newAlready },
        },
      });
    })
  );

  if (choice === "action") {
    actionRemain = actionRemain.filter((action) => action !== randomCard.id);
  } else {
    veriteRemain = veriteRemain.filter((verite) => verite !== randomCard.id);
  }

  if (!actionRemain.length) {
    await Promise.all(
      gameData.gamers.map(async (gamer) => {
        const alreadyIdList =
          (
            await prisma.user.findFirst({
              where: {
                id: gamer.id,
              },
              select: {
                alreadyActionouverite: true,
              },
            })
          )?.alreadyActionouverite?.idList || [];

        const allActions = (
          await prisma.actionouverite.findMany({
            where: {
              type: "action",
            },
            select: {
              id: true,
            },
          })
        ).map((card) => card.id);

        const alreadyIdListSET = new Set(alreadyIdList);
        allActions.map((action) => alreadyIdListSET.delete(action));

        const newAlready = [...alreadyIdListSET];
        await prisma.user.update({
          where: {
            id: gamer.id,
          },
          data: {
            alreadyActionouverite: newAlready,
          },
        });
      })
    );

    if (actionSecond.length) {
      actionRemain = [...actionSecond];
      actionSecond = [];
    } else {
      actionRemain = (
        await prisma.actionouverite.findMany({
          where: {
            type: "action",
          },
          select: {
            id: true,
          },
        })
      ).map((card) => card.id);
    }
  }

  if (!veriteRemain.length) {
    await Promise.all(
      gameData.gamers.map(async (gamer) => {
        const alreadyIdList =
          (
            await prisma.user.findFirst({
              where: {
                id: gamer.id,
              },
              select: {
                alreadyActionouverite: true,
              },
            })
          )?.alreadyActionouverite?.idList || [];

        const allVerites = (
          await prisma.actionouverite.findMany({
            where: {
              type: "vérité",
            },
            select: {
              id: true,
            },
          })
        ).map((card) => card.id);

        const alreadyIdListSET = new Set(alreadyIdList);
        allVerites.map((verite) => alreadyIdListSET.delete(verite));

        const newAlready = [...alreadyIdListSET];
        await prisma.user.update({
          where: {
            id: gamer.id,
          },
          data: {
            alreadyActionouverite: newAlready,
          },
        });
      })
    );

    if (veriteSecond.length) {
      veriteRemain = [...veriteSecond];
      veriteSecond = [];
    } else {
      veriteRemain = (
        await prisma.actionouverite.findMany({
          where: {
            type: "vérité",
          },
          select: {
            id: true,
          },
        })
      ).map((card) => card.id);
    }
  }

  const newData = (
    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        gameData: {
          ...gameData,
          activePlayer: newActivePlayer,
          card: randomCard,
          remain: { actionRemain, veriteRemain },
          secondRemain: { action: actionSecond, verite: veriteSecond },
        },
      },
    })
  ).gameData;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}
