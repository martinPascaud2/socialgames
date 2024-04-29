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

  if (options.mode === "peek") {
    gamersAndGuests[0].place = 1;
  } else {
    const places = gamersAndGuests.map((_, i) => i + 1);
    gamersAndGuests.forEach((_, index) => {
      const randomPlaceIndex = Math.floor(Math.random() * places.length);
      const randomPlace = places[randomPlaceIndex];
      gamersAndGuests[index].place = randomPlace;
      places.splice(randomPlaceIndex, 1);
    });
  }

  const phase = options.mode === "peek" ? "peek" : "write";

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      phase,
      options,
      actions: {},
      senders: [],
    },
  });

  return {};
}

export async function aimPlayer({ aimerPlace, aimed, roomToken, gameData }) {
  const { gamers } = gameData;
  const newGamers = [...gamers];
  const aimedIndex = newGamers.findIndex((gamer) => gamer.name === aimed.name);

  newGamers[aimedIndex].place = aimerPlace + 1;

  const newActivePlayer = newGamers[aimedIndex];

  const newPhase = aimerPlace + 1 === newGamers.length ? "write" : "peek";

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      activePlayer: newActivePlayer,
      gamers: newGamers,
      phase: newPhase,
    },
  });
}

export async function sendActions({
  sender,
  aimed,
  sentActions,
  roomToken,
  gameData,
}) {
  const { actions, senders } = gameData;
  const newActions = { ...actions, [aimed.name]: sentActions };
  const newSenders = [...senders, sender];

  const phase =
    newSenders.length === gameData.gamers.length ? "exchange" : "write";

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      actions: newActions,
      senders: newSenders,
      phase,
    },
  });

  await Promise.all(
    Object.values(sentActions).map(async (a) => {
      const action = await prisma.triactionAction.create({
        data: { action: a },
      });
      return action;
    })
  );
}
