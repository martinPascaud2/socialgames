"use server";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  guests,
  multiGuests,
  options,
}) {
  const startedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      started: true,
    },
  });

  // utils quand 2e jeu
  const gamersAndGuests = Object.entries(startedRoom.gamers).map((gamer) => ({
    id: gamer[1],
    name: gamer[0],
    guest: false,
    multiGuest: false,
  }));

  guests.map((guest) => {
    gamersAndGuests.push({
      id: adminId,
      name: guest,
      guest: true,
      multiGuest: false,
    });
  });

  let startIndex = 0;
  gamersAndGuests.map((gamer) => {
    if (gamer.id >= startIndex) startIndex = gamer.id + 1;
  });
  multiGuests.map((multiGuest) => {
    gamersAndGuests.push({
      id: startIndex,
      name: multiGuest,
      guest: false,
      multiGuest: true,
    });
    startIndex++;
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      gamers: gamersAndGuests,
      ended: true,
    },
  });
}
