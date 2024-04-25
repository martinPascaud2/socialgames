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

  gamersAndGuests[0].place = 1;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      phase: "peek",
    },
  });

  return {};
}

export async function aimPlayer({ aimerPlace, aimed, roomToken, gameData }) {
  const { gamers } = gameData;
  const newGamers = [...gamers];
  const aimedIndex = newGamers.findIndex((gamer) => gamer.name === aimed.name);

  let maxPlace = 0;
  newGamers.forEach((gamer) => {
    if (gamer.place > maxPlace) maxPlace = gamer.place;
  });
  newGamers[aimedIndex].place = maxPlace + 1;

  const newActivePlayer = newGamers[aimedIndex];

  const newPhase = maxPlace + 1 === newGamers.length ? "write" : "peek";

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      activePlayer: newActivePlayer,
      gamers: newGamers,
      phase: newPhase,
    },
  });
}
