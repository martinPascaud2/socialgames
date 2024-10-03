"use server";

import prisma from "@/utils/prisma";
import pusher from "@/utils/pusher";
import getDistance from "@/utils/getDistance";
import { getRoomFriendList } from "@/utils/getFriendList";

export async function serverCreate(
  token,
  privacy,
  user,
  game,
  geoLocation,
  viceAdmin
) {
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
        gameData: {},
        options: {},
        viceAdmin: viceAdmin || null,
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

  return { gamers: [user.name] };
}

export async function saveLocation({ geoLocation, roomId }) {
  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      adminLocation: geoLocation,
    },
  });
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
  try {
    await pusher.trigger(`room-${oldRoomToken}`, "room-event", {
      gameData: {
        nextGame: {
          name: gameName,
          path: `${pathname}?token=${newRoomToken}`,
        },
      },
    });
  } catch (error) {
    console.error("error", error);
  }
}

export async function changeOptions({ roomId, roomToken, options }) {
  try {
    await prisma.$transaction(async () => {
      const roomOptions = (
        await prisma.room.findFirst({
          where: { id: roomId },
        })
      ).options;

      if (JSON.stringify(roomOptions) !== JSON.stringify(options)) {
        await prisma.room.update({
          where: { id: roomId },
          data: { options: options },
        });

        await pusher.trigger(`room-${roomToken}`, "room-event", {
          options,
        });
      }
    });
  } catch (error) {
    console.error("error", error);
  }
}

// for new games
export async function syncNewOptions({ roomToken, gameData, options }) {
  try {
    await prisma.$transaction(async () => {
      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: {
          ...gameData,
          options,
        },
      });
    });
  } catch (error) {
    console.error("error", error);
  }
}

export async function inviteFriend({
  userName,
  friendMail,
  categorie,
  gameName,
  mode,
  roomToken,
  deleted = false,
}) {
  await pusher.trigger(`user-${friendMail}`, "user-event", {
    invitation: {
      userName,
      gameName,
      mode,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/categories/${categorie}/${gameName}?token=${roomToken}`,
      deleted,
    },
  });
}

export async function inviteAll({
  userId,
  userName,
  categorie,
  gameName,
  mode,
  roomToken,
}) {
  const friends = await getRoomFriendList({ userId });

  await Promise.all(
    friends.map(async (friend) => {
      await inviteFriend({
        userName,
        friendMail: friend.email,
        categorie,
        gameName,
        mode,
        roomToken,
      });
    })
  );
}

export async function deleteInvitations({
  userId,
  categorie,
  gameName,
  roomToken,
}) {
  const friends = await getRoomFriendList({ userId });
  await Promise.all(
    friends.map(async (friend) => {
      await inviteFriend({
        friendMail: friend.email,
        categorie,
        gameName,
        roomToken,
        deleted: true,
      });
    })
  );
}

export async function deleteRoom({ roomId }) {
  await prisma.room.delete({ where: { id: roomId } });
}

export async function getUniqueName(roomId, wantedName, isReserved) {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
    },
  });

  if (isReserved) return wantedName;

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

export async function serverJoin({ token, user }) {
  try {
    const result = await prisma.$transaction(async () => {
      const room = await prisma.room.findFirst({
        where: {
          token,
        },
      });

      if (!room) return { error: "Token incorrect" };

      const hasLeft =
        room.haveLeft && Object.keys(room.haveLeft).includes(user.name);
      if (hasLeft) return { error: "La partie n'est plus accessible" };

      if (!room.viceAdmin && user.name !== room.admin) {
        await prisma.room.update({
          where: { id: room.id },
          data: {
            viceAdmin: user.name,
          },
        });
      }

      // if (room.started) return { error: "La partie a déjà été lancée" };
      if (Object.values(room.gamers).includes(user.id)) {
        return {
          joinData: {
            isJoinAgain: true,
            game: room.game,
            admin: room.admin,
            adminLocation: room.adminLocation,
            gameData: room.gameData,
            gamers: Object.keys(room.gamers),
            guests: Object.keys(room.guests),
            multiGuests: Object.keys(room.multiGuests),
            options: room.options,
            isStarted: room.started,
          },
        };
      }

      const { id: roomId, options } = room;

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

      return {
        joinData: {
          admin: room.admin,
          game: room.game,
          gamers: newGamerList,
          guests,
          multiGuests,
          options,
          isStarted: room.started,
        },
        error: null,
      };
    });
    return result;
  } catch (error) {
    console.error("error", error);
  }
}

export async function serverAddMultiGuest(token, multiGuestName, geoLocation) {
  if (!geoLocation) return { error: "Chargement..." };

  const room = await prisma.room.findFirst({
    where: {
      token,
    },
  });

  if (!room) return { error: "Token incorrect" };

  if (!room.viceAdmin) {
    await prisma.room.update({
      where: { id: room.id },
      data: {
        viceAdmin: multiGuestName,
      },
    });
  }

  // if (room.started) return { error: "La partie a déjà été lancée" };
  if (room.started) {
    return {
      data: {
        isJoinAgain: true,
        game: room.game,
        admin: room.admin,
        gameData: room.gameData,
        gamers: Object.keys(room.gamers),
        guests: Object.keys(room.guests),
        multiGuests: Object.keys(room.multiGuests),
        options: room.options,
        isStarted: room.started,
      },
    };
  }

  const { id: roomId, adminLocation, multiGuests, options } = room;

  const distance = getDistance({ first: adminLocation, second: geoLocation });
  if (distance > 500)
    return { error: "Veuillez vous approcher de la zone de jeu" };

  const gamerList = Object.keys(room.gamers);
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

  return {
    data: {
      admin: room.admin,
      game: room.game,
      gamerList,
      guests,
      multiGuests: newMultiGuests,
      options,
      isStarted: room.started,
    },
  };
}

export async function checkConnection({ roomId, uniqueName, isMultiGuest }) {
  const room = await prisma.room.findFirst({ where: { id: roomId } });
  const gamers = Object.keys(room.gamers);
  const multiGuests = Object.keys(room.multiGuests);
  if (gamers.includes(uniqueName) && !isMultiGuest) return true;
  if (multiGuests.includes(uniqueName) && isMultiGuest) return true;
  return false;
}

export async function retryGamerConnection({
  roomId,
  uniqueName,
  roomToken,
  userId,
}) {
  const room = await prisma.room.findFirst({ where: { id: roomId } });

  const newGamerList = Object.keys(
    (
      await prisma.room.update({
        where: { id: roomId },
        data: {
          gamers: {
            ...room.gamers,
            [uniqueName]: userId,
          },
        },
      })
    ).gamers
  );

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    clientGamerList: newGamerList,
  });
}

export async function retryMultiGuestConnection({
  roomId,
  uniqueName,
  roomToken,
}) {
  const room = await prisma.room.findFirst({ where: { id: roomId } });

  const newMultiGuests = Object.keys(
    (
      await prisma.room.update({
        where: { id: roomId },
        data: {
          multiGuests: {
            ...room.multiGuests,
            [uniqueName]: true,
          },
        },
      })
    ).multiGuests
  );

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    multiGuestList: newMultiGuests,
  });
}

export async function triggerGamers({ roomToken, gamers }) {
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    clientGamerList: gamers,
  });
}

export async function triggerMultiguests({ roomToken, multiGuests }) {
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    multiGuestList: multiGuests,
  });
}

export async function serverDeleteGamer({ token, gamerName }) {
  if (!token || !gamerName) return;

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

export async function serverDeleteMultiGuest({ token, multiGuestName }) {
  if (!token || !multiGuestName) return;

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

export async function togglePrivacy({ roomId, roomToken, privacy }) {
  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data: { private: !privacy },
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    privacy: updatedRoom.private,
  });
}

export async function saveData({ roomId, newData }) {
  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      gameData: newData,
    },
  });
}

export async function saveAndDispatchData({ roomId, roomToken, newData }) {
  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      gameData: newData,
    },
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: newData,
  });
}

export async function sendPresenceSign({
  roomToken,
  userName,
  userId,
  multiGuest,
}) {
  await pusher.trigger(`presence-${roomToken}`, "check-presence", {
    userName,
    time: Date.now(),
    userId,
    multiGuest,
  });
}

//dev
export async function getAllRoomData({ roomId }) {
  const data = (await prisma.room.findFirst({ where: { id: roomId } }))
    .gameData;
  console.log("data", data);
}

export async function getAllRoom({ roomId }) {
  const room = await prisma.room.findFirst({ where: { id: roomId } });
  console.log("room", room);
}
