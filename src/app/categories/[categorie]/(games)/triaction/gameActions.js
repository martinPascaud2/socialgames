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
  if (gamers.length + guests.length + multiGuests.length < 3)
    return { error: "Un plus grand nombre de joueurs est requis." };

  if (gamers.length + guests.length + multiGuests.length > 20)
    return { error: "Limite du nombre de joueurs dépassée : 20." };

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

  if (options.mode === "peek") {
    gamersAndGuests[0].place = 1;
  } else {
    const places = gamersAndGuests.map((_, i) => i + 1);
    gamersAndGuests.forEach((_, index) => {
      const randomPlaceIndex = Math.floor(Math.random() * places.length);
      const randomPlace = places[randomPlaceIndex];
      gamersAndGuests[index].place = randomPlace;
      places.splice(randomPlaceIndex, 1);
    });
  }

  const phase = options.mode === "peek" ? "peek" : "write";

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      activePlayer: gamersAndGuests[0],
      gamers: gamersAndGuests,
      phase,
      options,
      actions: {},
      senders: [],
    },
  });

  return {};
}

export async function aimPlayer({ aimerPlace, aimed, roomToken, gameData }) {
  const { gamers } = gameData;
  const newGamers = [...gamers];
  const aimedIndex = newGamers.findIndex((gamer) => gamer.name === aimed.name);

  newGamers[aimedIndex].place = aimerPlace + 1;

  const newActivePlayer = newGamers[aimedIndex];

  const newPhase = aimerPlace + 1 === newGamers.length ? "write" : "peek";

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      activePlayer: newActivePlayer,
      gamers: newGamers,
      phase: newPhase,
    },
  });
}

export async function sendActions({
  sender,
  aimed,
  sentActions,
  roomToken,
  gameData,
}) {
  const { actions, senders } = gameData;
  const newActions = { ...actions, [aimed.name]: sentActions };
  const newSenders = [...senders, sender];

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      actions: newActions,
      senders: newSenders,
    },
  });

  await Promise.all(
    Object.values(sentActions).map(async (a) => {
      const action = await prisma.triactionAction.create({
        data: { action: a },
      });
      return action;
    })
  );

  if (newSenders.length === gameData.gamers.length) {
    setTimeout(async () => {
      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: {
          ...gameData,
          phase: "exchange",
          actions: newActions,
          senders: [],
        },
      });
    }, 2000);
  }
}

export async function sendActionBack({ backed, roomToken, gameData }) {
  const { actions } = gameData;
  const { aimed, action } = backed;

  const gamerActions = actions[aimed.name];
  const newGamerActions = { ...gamerActions, backed: action };
  const newActions = { ...actions, [aimed.name]: newGamerActions };

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      actions: newActions,
    },
  });
}

export async function proposeAction({
  sender,
  aimedName,
  proposed,
  hidden,
  roomToken,
  gameData,
}) {
  const propositions = gameData.propositions || {};
  const newPropositions = {
    ...propositions,
    [aimedName]: { sender: sender.name, proposed, hidden },
  };

  const { senders } = gameData;
  const newSenders = [...senders, sender];

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      propositions: newPropositions,
      senders: newSenders,
    },
  });

  if (newSenders.length === gameData.gamers.length) {
    setTimeout(async () => {
      await pusher.trigger(`room-${roomToken}`, "room-event", {
        gameData: {
          ...gameData,
          phase: "choose",
          propositions: newPropositions,
          senders: [],
        },
      });
    }, 2000);
  }
}
