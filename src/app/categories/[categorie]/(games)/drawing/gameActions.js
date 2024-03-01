"use server";

import { makeTeams, makeMinimalTeams } from "@/utils/makeTeams";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  //   gamers,
  guests,
  multiGuests,
  options,
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

  const { error, teams } =
    options.teamMode === "teamNumber"
      ? makeTeams({
          gamersList: gamersAndGuests,
          teamsNumber: options.teamsNumber,
        })
      : makeMinimalTeams({
          gamersList: gamersAndGuests,
          minByTeam: options.minByTeam,
        });
  if (error) return { error };

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      teams,
      options,
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
