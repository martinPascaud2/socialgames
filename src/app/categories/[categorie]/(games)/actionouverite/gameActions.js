"use server";

import Pusher from "pusher";

import prisma from "@/utils/prisma";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

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
    },
  });
}

const getNextGamer = (gamerList, gamer) => {
  const index = gamerList.indexOf(gamer);
  const nextIndex = (index + 1) % gamerList.length;
  const nextGamer = gamerList[nextIndex];
  return nextGamer;
};

export async function triggerGameEvent(roomId, roomToken, gameData) {
  const newActivePlayer = getNextGamer(gameData.gamers, gameData.activePlayer);
  const newData = (
    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        gameData: { ...gameData, activePlayer: newActivePlayer },
      },
    })
  ).gameData;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}
