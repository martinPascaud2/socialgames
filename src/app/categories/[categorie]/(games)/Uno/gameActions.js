"use server";

import pusher from "@/utils/pusher";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";

import { unoCards } from "./cardsData";

const getRandomCard = (remainCards) => {
  const randomCardIndex =
    remainCards[Math.floor(Math.random() * remainCards.length)];
  const randomCard = unoCards[randomCardIndex];
  const newRemainCards = remainCards.filter(
    (index) => index !== randomCardIndex
  );
  return { randomCard, newRemainCards };
};

const getStartedCards = ({ remainCards, gamersAndGuests }) => {
  let startedCards = {};
  let startedRemains = remainCards;
  gamersAndGuests.forEach((gamer) => {
    const gamerCards = [];
    for (let i = 7; i > 0; i--) {
      const { randomCard, newRemainCards: newStartedRemains } =
        getRandomCard(startedRemains);
      gamerCards.push(randomCard);
      startedRemains = newStartedRemains;
    }
    startedCards[gamer.name] = gamerCards;
  });

  return { startedCards, startedRemains };
};

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  gamers,
  guests,
  multiGuests,
  // options,
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

  let remainCards = Object.keys(unoCards).map((string) => parseInt(string));
  console.log("remainCards", remainCards);

  const { randomCard, newRemainCards } = getRandomCard(remainCards);
  console.log("randomCard", randomCard);
  console.log("newRemainCards", newRemainCards);

  remainCards = newRemainCards;
  console.log("remainCards 2e", remainCards);

  const { startedCards, startedRemains } = getStartedCards({
    remainCards,
    gamersAndGuests,
  });
  console.log("startedCards", startedCards);
  console.log("startedRemains", startedRemains, startedRemains.length);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      lastPlayer: null,
      gamers: gamersAndGuests,
      phase: "start", // check
      rotation: "clock",
      card: randomCard,
      remainCards: startedRemains,
      startedCards,
      mustDraw: false,
      toDraw: 0,

      // options,
    },
  });

  return {};
}

const getNextGamer = ({ gameData, card }) => {
  let { rotation } = gameData;
  if (card?.type === "reverse") {
    rotation = rotation === "clock" ? "trigo" : "clock";
  }

  const { gamers, activePlayer } = gameData;

  const index = gamers.findIndex(
    (gamer) => gamer.id === activePlayer.id && gamer.name === activePlayer.name
  );
  const nextIndex =
    rotation === "clock"
      ? (index + 1) % gamers.length
      : index === 0
      ? gamers.length - 1
      : index - 1;

  const skip = card?.type === "skip" ? 1 : 0;
  const nextSkippedIndex =
    rotation === "clock"
      ? (nextIndex + skip) % gamers.length
      : skip
      ? nextIndex === 0
        ? gamers.length - 1
        : nextIndex - 1
      : nextIndex;

  const nextGamer = gamers[nextSkippedIndex];

  return { newActivePlayer: nextGamer, newRotation: rotation };
};

export async function skipTurn({ roomToken, gameData }) {
  const { newActivePlayer } = getNextGamer({ gameData, card: null });
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      activePlayer: newActivePlayer,
      hasFreelyDrawn: false,
    },
  });
}

export async function playCard({ card, gameData, roomToken }) {
  const { newActivePlayer, newRotation } = getNextGamer({
    gameData,
    card: card[0],
  });

  const mustDraw = ["+2", "+4"].some((str) => str === card[0].data.text);
  let toDraw = 0;
  if (mustDraw) {
    toDraw = parseInt(card[0].data.text);
  }

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      activePlayer: newActivePlayer,
      card: card[0],
      rotation: newRotation,
      phase: "gaming",
      mustDraw,
      toDraw,
      hasFreelyDrawn: false,
    },
  });
}

export async function drawCard({ roomToken, gameData }) {
  const { remainCards, mustDraw, toDraw } = gameData;

  const { randomCard, newRemainCards } = getRandomCard(remainCards);

  const newToDraw = toDraw !== 0 ? toDraw - 1 : 0;
  let newMustDraw = mustDraw;
  let newActivePlayer = gameData.activePlayer;
  let hasFreelyDrawn = false;

  if (mustDraw && newToDraw === 0) {
    newActivePlayer = getNextGamer({ gameData, card: null }).newActivePlayer;
    newMustDraw = false;
  } else if (!mustDraw) {
    hasFreelyDrawn = true;
  }

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      remainCards: newRemainCards,
      activePlayer: newActivePlayer,
      mustDraw: newMustDraw,
      toDraw: newToDraw,
      hasFreelyDrawn,
    },
  });

  return randomCard;
}
