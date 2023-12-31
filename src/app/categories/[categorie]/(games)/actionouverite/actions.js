"use server";

import prisma from "@/utils/prisma";
import pusher from "@/utils/pusher";
import getDistance from "@/utils/getDistance";

export async function serverCreate(token, user, game, geoLocation) {
  if (!geoLocation)
    throw new Error(
      "Veuillez activer votre géolocalisation ; détection en cours..."
    );

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
      guests: {},
      multiGuests: {},
    },
    include: {
      gamerList: true,
    },
  });

  //dispensable
  const gamerList = newRoom.gamerList.map((gamer) => ({
    id: gamer.id,
    name: gamer.name,
  }));
  return gamerList;
}

export async function serverJoin({ token, user }) {
  console.log("user serverjoin 14", user);
  // if (!geoLocation)
  //   throw new Error(
  //     "Veuillez activer votre géolocalisation ; détection en cours..."
  //   );

  const room = await prisma.room.findFirst({
    where: {
      token,
    },
    include: {
      gamerList: true,
    },
  });

  if (!room) throw new Error("Token incorrect");
  //ici
  if (room.started && !room.gamerList.some((gamer) => gamer.name === user.name))
    throw new Error("La partie a déjà été lancée");

  console.log("room serverJoin", room);
  // const { adminLocation, id: roomId } = room;
  const { id: roomId } = room;

  // const distance = getDistance({ first: adminLocation, second: geoLocation });
  // if (distance > 50)
  //   throw new Error("Veuillez vous approcher de la zone de jeu");

  const newGamerList = [...room.gamerList, user];
  // const newGamerList = room.gamerList.map((gamer) => {
  //   const uniqueNamedGamer = {
  //     ...gamer,
  //     ...(gamer.id === user.id ? { name: user.name } : {}),
  //   };
  //   return uniqueNamedGamer;
  // });
  console.log("newGamerList", newGamerList);
  // console.log("newGamerListTEST", newGamerListTEST);

  // const updatedRoom = await prisma.room.update({
  const updatedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      // gamerList: {
      gamerList: {
        connect: {
          id: user.id,
        },

        // set: newGamerList.map((u) => ({ id: u.id, name: u.name })),
        // { ...newGamerList },
        // set: newGamerList.map((u) => ({ id: u.id })),
        // },
        // gamerList: newGamerList,
      },
    },
    include: {
      gamerList: true,
    },
  });

  const updatedRoomTEST = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      gamerList: {
        update: {
          where: {
            id: user.id,
          },
          data: {
            name: user.name,
          },
        },
      },
    },
    include: {
      gamerList: true,
    },
  });
  console.log("updatedRoomTEST", updatedRoomTEST);

  console.log("updatedRoom serverjoin", updatedRoom);
  const clientGamerList = updatedRoom.gamerList.map((user) => ({
    id: user.id,
    name: user.name,
  }));

  const guests = Object.keys(room.guests);
  const multiGuests = Object.keys(room.multiGuests);

  await pusher.trigger(`room-${token}`, "room-event", {
    clientGamerList,
  });

  return {
    gamers: clientGamerList,
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

  console.log("room serverAddGuest before", room);
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

  //enlever
  const updatedRoom = await prisma.room.findFirst({
    where: {
      token,
    },
    include: {
      gamerList: true,
    },
  });
  console.log("updatedRoom", updatedRoom);

  return newGuests;
}

export async function serverAddMultiGuest(token, multiGuestName, geoLocation) {
  console.log("allé dans add");
  console.log("geoLocation", geoLocation);
  if (!geoLocation)
    throw new Error(
      "Veuillez activer votre géolocalisation ; détection en cours..."
    );
  console.log("toujours rien");
  const room = await prisma.room.findFirst({
    where: {
      token,
    },
    include: {
      gamerList: true,
    },
  });

  if (!room) throw new Error("Token incorrect");
  if (
    room.started &&
    !room.gamerList.some((gamer) => gamer.name === multiGuestName) //vérifier multiguest dans liste
  )
    throw new Error("La partie a déjà été lancée");

  const { id: roomId, adminLocation, gamerList, multiGuests } = room;

  const distance = getDistance({ first: adminLocation, second: geoLocation });
  if (distance > 50)
    throw new Error("Veuillez vous approcher de la zone de jeu");

  const guests = Object.keys(room.guests); //ici

  console.log("room", room);

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
  console.log("newMultiGuests", newMultiGuests);

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

export async function getUniqueName(roomId, wantedName) {
  console.log("wantedName", wantedName);
  //utils
  // const genToken = (length) => {
  //   let roomToken = "";
  //   const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  //   let count = 0;
  //   while (count < length) {
  //     roomToken += chars.charAt(Math.floor(Math.random() * chars.length));
  //     count++;
  //   }
  //   return roomToken;
  // };
  // console.log("getUniqueName");
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
    },
    include: {
      gamerList: true,
    },
  });
  console.log("room uniqueName", room);
  const gamers = room.gamerList.map((gamer) => gamer.name);
  console.log("gamers uniqueName", gamers);
  const guests = Object.keys(room.guests);
  console.log("guests uniqueName", guests);
  const multiGuests = Object.keys(room.multiGuests);
  console.log("multiGuests uniqueName", multiGuests);
  const allNames = [...gamers, ...guests, ...multiGuests];
  console.log("allNames", allNames);
  const getAlreadyTaken = (triedName) => {
    console.log(
      "triedName",
      triedName,
      "allNames.some((name) => name === triedName)",
      allNames.some((name) => name === triedName)
    );
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

  // const occurences = allNames.reduce((acc, name) => {
  //   if (name === wantedName) return acc + 1;
  //   return acc;
  // }, 0);
  // console.log("occurences", occurences);
  // const uniqueName = `${wantedName}${
  //   occurences > 0 ? `(${occurences + 1})` : ""
  // }`;
  console.log("uniqueName in function", uniqueName);
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
