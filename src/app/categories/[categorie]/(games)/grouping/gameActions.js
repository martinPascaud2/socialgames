"use server";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdmin from "@/utils/checkViceAdmin";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
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
  const viceAdmin = await checkViceAdmin({
    roomId,
    admin: startedRoom.admin,
    viceAdmin: startedRoom.viceAdmin,
    gamersAndGuests,
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      viceAdmin,
      gamers: gamersAndGuests,
      ended: true,
    },
  });

  return {};
}

// check: no removeGamers
