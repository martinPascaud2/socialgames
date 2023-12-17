"use server";

import Pusher from "pusher";

import prisma from "@/utils/prisma";
import getDistance from "@/utils/getDistance";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function serverCreate(token, user, game, geoLocation) {
  if (!geoLocation) throw new Error("Veuillez activer votre géolocalisation");

  const userList = [user];

  const newRoom = await prisma.room.create({
    data: {
      game,
      token,
      admin: user.name,
      adminLocation: geoLocation,
      gamerList: {
        connect: userList.map((u) => ({ id: u.id })),
      },
    },
    include: {
      gamerList: true,
    },
  });

  const gamerList = newRoom.gamerList.map((gamer) => gamer.name);
  return gamerList;
}

export async function serverJoin(token, user, geoLocation) {
  if (!geoLocation) throw new Error("Veuillez activer votre géolocalisation");

  const room = await prisma.room.findFirst({
    where: {
      token,
    },
    include: {
      gamerList: true,
    },
  });

  if (!room) throw new Error("Token incorrect");
  if (room.started && !room.gamerList.some((gamer) => gamer.name === user.name))
    throw new Error("La partie a déjà été lancée");

  const { adminLocation, id: roomId } = room;

  const distance = getDistance({ adminLocation, incomerLocation: geoLocation });
  if (distance > 20)
    throw new Error("Veuillez vous approcher de la zone de jeu");

  const newGamerList = [...room.gamerList, user];

  const updatedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      gamerList: {
        set: newGamerList.map((u) => ({ id: u.id })),
      },
    },
    include: {
      gamerList: true,
    },
  });

  const clientGamerList = updatedRoom.gamerList.map((user) => user.name);

  await pusher.trigger(`room-${token}`, "room-event", {
    clientGamerList,
  });

  return { gamers: clientGamerList, alreadyStarted: room.started };
}

export async function joinAgain(token) {
  const { started, gameData } = await prisma.room.findFirst({
    where: {
      token,
    },
    select: {
      started: true,
      gameData: true,
    },
  });
  await pusher.trigger(`room-${token}`, "room-event", {
    started,
    gameData,
  });
}

export async function getId(token) {
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
