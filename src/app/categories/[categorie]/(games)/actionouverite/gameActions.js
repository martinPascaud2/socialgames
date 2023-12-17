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

export async function triggerGameEvent(roomId, roomToken, gameData) {
  const newActivePlayer = getNextGamer(gameData.gamers, gameData.activePlayer);
  const newCard = gameData.card + 1;
  const newData = (
    await prisma.room.update({
      where: {
        id: roomId,
      },
      data: {
        gameData: { ...gameData, activePlayer: newActivePlayer, card: newCard },
      },
    })
  ).gameData;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}
