"use server";

import prisma from "@/utils/prisma";
import pusher from "@/utils/pusher";
import getDistance from "@/utils/getDistance";

export async function serverCreate(token, user, game, geoLocation) {
  if (!geoLocation)
    throw new Error(
      "Veuillez activer votre géolocalisation ; détection en cours..."
    );

  await prisma.room.create({
    data: {
      game,
      token,
      admin: user.name,
      adminLocation: geoLocation,
      gamers: { [user.name]: user.id },
      guests: {},
      multiGuests: {},
    },
  });

  return [user.name];
}

export async function serverJoin({ token, user }) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });

  if (Object.values(room.gamers).includes(user.id)) return;
  if (!room) throw new Error("Token incorrect");
  // if (room.started && !room.gamerList.some((gamer) => gamer.name === user.name))
  //   throw new Error("La partie a déjà été lancée");

  const { id: roomId } = room;
  const newGamerList = Object.keys(
    (
      await prisma.room.update({
        where: { id: roomId },
        data: {
          gamers: {
            ...room.gamers,
            [user.name]: user.id,
          },
        },
      })
    ).gamers
  );
  const guests = Object.keys(room.guests);
  const multiGuests = Object.keys(room.multiGuests);

  await pusher.trigger(`room-${token}`, "room-event", {
    clientGamerList: newGamerList,
  });

  return {
    gamers: newGamerList,
    guests,
    multiGuests,
    alreadyStarted: room.started,
  };
}

export async function serverAddGuest({ token, guestName }) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });
  if (!room) throw new Error("Token incorrect");

  const { id: roomId, guests } = room;

  const newGuests = Object.keys(
    (
      await prisma.room.update({
        where: { id: roomId },
        data: {
          guests: {
            ...guests,
            [guestName]: true,
          },
        },
      })
    ).guests
  );

  await pusher.trigger(`room-${token}`, "room-event", {
    guestList: newGuests,
  });

  return newGuests;
}

export async function serverAddMultiGuest(token, multiGuestName, geoLocation) {
  if (!geoLocation)
    throw new Error(
      "Veuillez activer votre géolocalisation ; détection en cours..."
    );

  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });

  if (!room) throw new Error("Token incorrect");
  // if (
  //   room.started &&
  //   !room.gamerList.some((gamer) => gamer.name === multiGuestName)
  // )
  //   throw new Error("La partie a déjà été lancée");

  const { id: roomId, adminLocation, gamers, multiGuests } = room;

  const distance = getDistance({ first: adminLocation, second: geoLocation });
  if (distance > 50)
    throw new Error("Veuillez vous approcher de la zone de jeu");

  const gamerList = Object.keys(gamers);
  const guests = Object.keys(room.guests);
  const newMultiGuests = Object.keys(
    (
      await prisma.room.update({
        where: { id: roomId },
        data: {
          multiGuests: {
            ...multiGuests,
            [multiGuestName]: true,
          },
        },
      })
    ).multiGuests
  );

  await pusher.trigger(`room-${token}`, "room-event", {
    multiGuestList: newMultiGuests,
  });

  return {
    gamerList,
    guests,
    multiGuests: newMultiGuests,
    alreadyStarted: room.started,
  };
}

export async function getUniqueName(roomId, wantedName) {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });
  const gamers = Object.keys(room.gamers);
  const guests = Object.keys(room.guests);
  const multiGuests = Object.keys(room.multiGuests);
  const allNames = [...gamers, ...guests, ...multiGuests];

  const getAlreadyTaken = (triedName) => {
    return allNames.some((name) => name === triedName);
  };

  let uniqueName = wantedName;
  let addedNumber = 0;
  while (getAlreadyTaken(uniqueName)) {
    uniqueName = `${wantedName}${
      addedNumber > 0 ? `(${addedNumber + 1})` : ""
    }`;
    addedNumber++;
  }

  return uniqueName;
}

export async function getRoomId(token) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  return room?.id;
}
