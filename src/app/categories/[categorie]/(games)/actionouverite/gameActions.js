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
      activePlayer: gamers[0],
      gamers,
      card: 0,
    },
  });
}

const getNextGamer = (gamerList, gamer) => {
  const index = gamerList.indexOf(gamer);
  const nextIndex = (index + 1) % gamerList.length;
  const nextGamer = gamerList[nextIndex];
  return nextGamer;
};

export async function triggerGameEvent(roomId, roomToken, gameData, choice) {
  let actionRemain;
  let veriteRemain;

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
  } else {
    actionRemain = gameData.remain.actionRemain;
    veriteRemain = gameData.remain.veriteRemain;
  }

  const newActivePlayer =
    actionRemain.length && veriteRemain.length
      ? getNextGamer(gameData.gamers, gameData.activePlayer)
      : null;

  const choicedList = choice === "action" ? actionRemain : veriteRemain;
  const randomIndex =
    choicedList[Math.floor(Math.random() * choicedList.length)];
  const randomCard = await prisma.actionouverite.findFirst({
    where: {
      id: randomIndex,
    },
  });

  if (choice === "action") {
    actionRemain = actionRemain.filter((action) => action !== randomCard.id);
  } else {
    veriteRemain = veriteRemain.filter((verite) => verite !== randomCard.id);
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
        },
      },
    })
  ).gameData;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}
