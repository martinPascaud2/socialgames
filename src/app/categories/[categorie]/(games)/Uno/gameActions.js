"use server";

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

      // options,
    },
  });

  return {};
}
