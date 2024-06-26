"use server";

import pusher from "@/utils/pusher";

import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkPlayers from "@/utils/checkPlayers";

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
  const { error: playersError } = checkPlayers({
    gameName: "uno",
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

  let remainCards = Object.keys(unoCards).map((string) => parseInt(string));

  const { randomCard, newRemainCards } = getRandomCard(remainCards);
  const usedCards = [randomCard.id];
  remainCards = newRemainCards;

  const { startedCards, startedRemains } = getStartedCards({
    remainCards,
    gamersAndGuests,
  });

  const initCounts = async () => {
    await Promise.all(
      gamersAndGuests.map(async (gamer) => {
        if (!gamer.multiGuest) {
          await prisma.user.update({
            where: { id: gamer.id },
            data: { unoCount: 0 },
          });
        } else {
          await prisma.multiguest.upsert({
            where: { id: gamer.dataId },
            update: { unoCount: 0 },
            create: {
              id: gamer.dataId,
              unoCount: 0,
            },
          });
        }
      })
    );
  };
  await initCounts();

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      phase: "start",
      rotation: "clock",
      card: randomCard,
      remainCards: startedRemains,
      usedCards,
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

export async function playCard({ card, gameData, roomToken, unoPlayerName }) {
  const { newActivePlayer, newRotation } = getNextGamer({
    gameData,
    card: card[0],
  });

  const mustDraw = ["+2", "+4"].some((str) => str === card[0].data.text);
  let toDraw = 0;
  if (mustDraw) {
    toDraw = parseInt(card[0].data.text);
  }

  const { usedCards } = gameData;
  const newUsedCards = usedCards;
  newUsedCards.push(card[0].id);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      activePlayer: newActivePlayer,
      card: card[0],
      usedCards: newUsedCards,
      rotation: newRotation,
      phase: unoPlayerName ? "uno" : "gaming",
      unoPlayerName,
      mustDraw,
      toDraw,
      hasFreelyDrawn: false,
    },
  });
}

export async function drawCard({ roomToken, gameData }) {
  const { remainCards, mustDraw, toDraw, usedCards } = gameData;

  let { randomCard, newRemainCards } = getRandomCard(remainCards);

  let newUsedCards = usedCards;
  if (newRemainCards.length === 0) {
    newRemainCards = usedCards;
    newUsedCards = [];
  }

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
      usedCards: newUsedCards,
      activePlayer: newActivePlayer,
      mustDraw: newMustDraw,
      toDraw: newToDraw,
      hasFreelyDrawn,
      phase: "gaming",
    },
  });

  return randomCard;
}

export async function untriggerUnoPhase({ roomToken, gameData }) {
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "gaming",
    },
  });
}

export async function triggerUnoFail({ roomToken, gameData }) {
  const { unoPlayerName } = gameData;
  const newActivePlayer = gameData.gamers.find(
    (gamer) => gamer.name === unoPlayerName
  );

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      activePlayer: newActivePlayer,
      mustDraw: true,
      toDraw: 2,
      phase: "gaming",
    },
  });
}

export async function goEnd({ roomToken, gameData }) {
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "ended",
    },
  });

  let counts = {};
  setTimeout(async () => {
    await Promise.all(
      gameData.gamers.map(async (gamer) => {
        if (gamer.multiGuest) {
          const count = (
            await prisma.multiguest.findFirst({ where: { id: gamer.dataId } })
          ).unoCount;
          counts[gamer.name] = count;
        } else {
          const count = (
            await prisma.user.findFirst({ where: { id: gamer.id } })
          ).unoCount;
          counts[gamer.name] = count;
        }
      })
    );

    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        phase: "ended",
        ended: true,
        counts,
        activePlayer: null,
      },
    });
  }, 3000);
}

export async function addCount({ user, count }) {
  if (user.multiGuest) {
    const oldCount = (
      await prisma.multiguest.findFirst({ where: { id: user.dataId } })
    ).unoCount;
    const newCount = oldCount + count;

    await prisma.multiguest.upsert({
      where: { id: user.dataId },
      update: { unoCount: newCount },
      create: {
        id: user.dataId,
        unoCount: newCount,
      },
    });
  } else {
    const oldCount = (await prisma.user.findFirst({ where: { id: user.id } }))
      .unoCount;
    const newCount = oldCount + count;

    await prisma.user.update({
      where: { id: user.id },
      data: { unoCount: newCount },
    });
  }
}

export async function goNewUnoGame({ roomToken, gameData }) {
  const { gamers } = gameData;
  let remainCards = Object.keys(unoCards).map((string) => parseInt(string));
  const { randomCard, newRemainCards } = getRandomCard(remainCards);
  const usedCards = [randomCard.id];
  remainCards = newRemainCards;
  const { startedCards, startedRemains } = getStartedCards({
    remainCards,
    gamersAndGuests: gamers,
  });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      activePlayer: gamers[0],
      phase: "start",
      rotation: "clock",
      card: randomCard,
      remainCards: startedRemains,
      usedCards,
      startedCards,
      mustDraw: false,
      toDraw: 0,
      ended: false,
      // options,
    },
  });
}
