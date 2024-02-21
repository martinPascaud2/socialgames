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
      cards: {},
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

  const icons = alreadySelected.map((key) => ({
    key,
    triggered: false,
    discovered: false,
  }));

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      icons,
    },
  });
}

const getNextGamer = (gamers, activePlayer, newIcons) => {
  let triggered = newIcons.filter((icon) => icon.triggered).length;
  if (triggered <= 1) return activePlayer;

  const index = gamers.findIndex(
    (gamer) => gamer.id === activePlayer.id && gamer.name === activePlayer.name
  );
  const nextIndex = (index + 1) % gamers.length;
  const nextGamer = gamers[nextIndex];
  return nextGamer;
};

export async function revealCard({ roomToken, gameData, index, iconKey }) {
  const { icons } = gameData;

  const icon = icons[index];

  const newIcon = { ...icon, triggered: true };

  const newIcons = [...icons];
  newIcons[index] = newIcon;

  let success = false;
  const checkDiscovered = () => {
    const newIconKey = newIcon.key;
    let count = 0;
    newIcons.map((icon) => {
      if (icon.key === newIconKey && icon.triggered) count++;
    });
    if (count >= 2) {
      success = true;
      newIcons.forEach((icon, index) => {
        if (icon.key === newIconKey) {
          newIcons[index].discovered = true;
        }
      });
    }
  };
  checkDiscovered();

  const newActivePlayer = success
    ? gameData.activePlayer
    : getNextGamer(gameData.gamers, gameData.activePlayer, newIcons);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      icons: newIcons,
      activePlayer: newActivePlayer,
    },
  });
}

export async function hideUndiscovered({ roomToken, gameData }) {
  const { icons } = gameData;
  if (!icons) return;
  const newIcons = icons.map((icon) => ({ ...icon, triggered: false }));
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      icons: newIcons,
    },
  });
}
