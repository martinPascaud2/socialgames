"use server";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
// import pusher from "@/utils/pusher";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  //   gamers,
  guests,
  multiGuests,
  //   options,
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

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      //   options,
    },
  });

  return {};
}

export async function sendImage({
  imgData,
  roomId,
  roomToken,
  gameData,
  userName,
}) {
  const roomData =
    (await prisma.room.findFirst({ where: { id: roomId } })).gameData || {};

  console.log("roomData", roomData);

  const pngs = roomData.pngs || {};
  const newPngs = { ...pngs, [userName]: imgData };

  const newRoomData = { ...roomData, pngs: newPngs };

  await prisma.room.update({
    where: { id: roomId },
    data: { gameData: newRoomData },
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      newImageFrom: userName,
    },
  });
}

export async function getPng({ userName, roomId }) {
  const room = await prisma.room.findFirst({ where: { id: roomId } });
  const { gameData } = room;
  const { pngs } = gameData;
  const image = pngs[userName];

  return image;
}
