"use server";

import shuffleArray from "@/utils/shuffleArray";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkPlayers from "@/utils/checkPlayers";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  gamers,
  guests,
  multiGuests,
  options,
}) {
  const { error: playersError } = checkPlayers({
    gameName: "memory",
    gamers,
    guests,
    multiGuests,
  });
  if (playersError) return { error: playersError };

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

  const scores = gamersAndGuests.map((gamer) => ({
    [gamer.name]: 0,
  }));

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      scores,
      options,
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

  const sortedSelected = shuffleArray(alreadySelected);

  const icons = sortedSelected.map((key) => ({
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

  const newScores = [...gameData.scores];
  if (success) {
    const gamerIndex = newScores.findIndex(
      (score) => Object.entries(score)[0][0] === gameData.activePlayer.name
    );
    newScores[gamerIndex] = {
      [gameData.activePlayer.name]:
        Object.entries(newScores[gamerIndex])[0][1] + 1,
    };
  }

  const newActivePlayer = success
    ? gameData.activePlayer
    : getNextGamer(gameData.gamers, gameData.activePlayer, newIcons);

  const isEnded = newIcons.every((icon) => icon.discovered);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      icons: newIcons,
      activePlayer: newActivePlayer,
      scores: newScores,
      ended: isEnded,
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
