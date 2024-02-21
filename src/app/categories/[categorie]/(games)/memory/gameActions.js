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
  if (gamers.length + guests.length + multiGuests.length < 2)
    return { error: "Un plus grand nombre de joueurs est requis." };

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
    },
  });

  return {};
}

export async function getIcons({
  imageLength,
  pairsNumber,
  roomToken,
  gameData,
}) {
  console.log("imageLength", imageLength);
  console.log("gameData", gameData);
  console.log("pairsNumber", pairsNumber);

  const alreadySelected = [];
  let remaining = pairsNumber;
  while (remaining > 0) {
    const randomKey = Math.floor(Math.random() * imageLength);
    if (alreadySelected.some((key) => key === randomKey)) continue;
    alreadySelected.push(randomKey);
    alreadySelected.push(randomKey);
    remaining--;
  }
  alreadySelected.sort(() => Math.random() - 0.5);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      icons: alreadySelected,
    },
  });
}
