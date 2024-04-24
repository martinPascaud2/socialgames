"use server";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  gamers,
  guests,
  multiGuests,
  options,
}) {
  if (gamers.length + guests.length + multiGuests.length < 3)
    return { error: "Un plus grand nombre de joueurs est requis." };

  if (gamers.length + guests.length + multiGuests.length > 20)
    return { error: "Limite du nombre de joueurs dépassée : 20." };

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
      phase: "start",
    },
  });

  return {};
}
