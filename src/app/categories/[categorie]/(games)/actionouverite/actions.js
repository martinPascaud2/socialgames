"use server";

import prisma from "@/utils/prisma";
import pusher from "@/utils/pusher";
import getDistance from "@/utils/getDistance";

export async function serverCreate(token, privacy, user, game, geoLocation) {
  if (!geoLocation) throw new Error("Détection de votre géolocalisation...");

  const roomId = (
    await prisma.room.create({
      data: {
        private: privacy === "private",
        game,
        token,
        admin: user.name,
        adminLocation: geoLocation,
        gamers: { [user.name]: user.id },
        guests: {},
        multiGuests: {},
        creationDate: new Date(),
      },
    })
  ).id;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      roomId,
    },
  });

  return [user.name];
}

export async function finishGame({ roomToken, gameData }) {
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      ended: true,
    },
  });
}

export async function goOneMoreGame({
  pathname,
  oldRoomToken,
  newRoomToken,
  gameName,
}) {
  await pusher.trigger(`room-${oldRoomToken}`, "room-event", {
    gameData: {
      nextGame: {
        name: gameName,
        path: `${pathname}?token=${newRoomToken}`,
      },
    },
  });
}

export async function serverJoin({ token, user }) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });

  if (Object.values(room.gamers).includes(user.id)) return;
  if (!room) throw new Error("Token incorrect");
  if (room.started) throw new Error("La partie a déjà été lancée");

  const { id: roomId } = room;

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      roomId,
    },
  });

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
  };
}

export async function serverDeleteGamer({ token, gamerName }) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });
  const { id: roomId, gamers } = room;

  delete gamers[gamerName];

  await prisma.room.update({
    where: { id: roomId },
    data: {
      gamers,
    },
  });

  const gamerList = Object.keys(gamers);
  await pusher.trigger(`room-${token}`, "room-event", {
    clientGamerList: gamerList,
    deleted: gamerName,
  });
  return gamerList;
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

export async function serverDeleteGuest({ token, guestName }) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });
  const { id: roomId, guests } = room;
  const newGuests = { ...guests };

  delete newGuests[guestName];

  await prisma.room.update({
    where: { id: roomId },
    data: {
      guests: newGuests,
    },
  });

  const newGuestList = Object.keys(newGuests);
  await pusher.trigger(`room-${token}`, "room-event", {
    guestList: newGuestList,
  });
  return newGuestList;
}

export async function serverAddMultiGuest(token, multiGuestName, geoLocation) {
  if (!geoLocation) throw new Error("Détection de votre géolocalisation...");

  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });

  if (!room) throw new Error("Token incorrect");
  if (room.started) throw new Error("La partie a déjà été lancée");

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
  };
}

export async function serverDeleteMultiGuest({ token, multiGuestName }) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });
  const { id: roomId, multiGuests } = room;

  delete multiGuests[multiGuestName];

  await prisma.room.update({
    where: { id: roomId },
    data: {
      multiGuests,
    },
  });

  const multiGuestList = Object.keys(multiGuests);
  await pusher.trigger(`room-${token}`, "room-event", {
    multiGuestList,
    deleted: multiGuestName,
  });
  return multiGuestList;
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

export async function getRoomRefs(token) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
    select: {
      id: true,
      private: true,
    },
  });
  return { id: room?.id, priv: room?.private };
}
