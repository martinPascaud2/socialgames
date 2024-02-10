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
  //   if (gamers.length + guests.length + multiGuests.length < 2)
  //     return { error: "Un plus grand nombre de joueurs est requis." };
  //max number ???

  const startedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      started: true,
      gameData: {},
    },
  });

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: startedRoom.gamers,
    guests,
    multiGuests,
  });

  if (gamersAndGuests.some((player) => player.guest))
    return { error: "Ce jeu est incompatible avec les guests monoscreen." };

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      gamers: gamersAndGuests,
    },
  });

  return {};
}

export async function goFirstRound({
  roomId,
  roomToken,
  gameData,
  imageNumber,
}) {
  const room = await prisma.room.findFirst({ where: { id: roomId } });
  console.log("room", room);
}
