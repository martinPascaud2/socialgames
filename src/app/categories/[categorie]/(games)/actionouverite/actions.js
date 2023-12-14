"use server";

import Pusher from "pusher";

import prisma from "@/utils/prisma";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function serverCreate(token, user, game) {
  const userList = [user];

  const newRoom = await prisma.room.create({
    data: {
      game,
      token,
      admin: user.name,
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

export async function serverJoin(token, user) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
    include: {
      gamerList: true,
    },
  });

  if (!room) throw new Error("Token incorrect");
  if (room.started) throw new Error("La partie a déjà été lancée");

  const { id: roomId } = room;
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

  return clientGamerList;
}

export async function launch(token) {
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });

  const { id } = room;

  const updatedRoom = await prisma.room.update({
    where: {
      id,
    },
    data: {
      started: true,
    },
    include: {
      gamerList: true,
    },
  });

  const clientGamerList = updatedRoom.gamerList.map((user) => user.name);

  await pusher.trigger(`room-${token}`, "room-event", {
    clientGamerList,
    started: updatedRoom.started,
  });
}
