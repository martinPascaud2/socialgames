"use server";

import { saveAndDispatchData } from "@/components/Room/actions";
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
    gameName: "triaction",
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

  if (options.mode === "Triaction (peek)") {
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

  const phase = options.mode === "Triaction (peek)" ? "peek" : "write";

  const newData = {
    admin: startedRoom.admin,
    activePlayer: gamersAndGuests[0],
    gamers: gamersAndGuests,
    phase,
    options,
    actions: {},
    senders: [],
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  // await pusher.trigger(`room-${roomToken}`, "room-event", {
  //   started: startedRoom.started,
  //   gameData: {
  //     admin: startedRoom.admin,
  //     activePlayer: gamersAndGuests[0],
  //     gamers: gamersAndGuests,
  //     phase,
  //     options,
  //     actions: {},
  //     senders: [],
  //   },
  // });

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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // setTimeout(async () => {
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        phase: "exchange",
        actions: newActions,
        senders: [],
      },
    });
    // }, 2000);
  }
}

export async function sendActionBack({ backed, roomToken, gameData, sender }) {
  // const { actions } = gameData;
  const { actions } = gameData;
  const { aimed, action } = backed;
  const backedActions = gameData.backedActions || {};

  const gamerActions = actions[aimed.name];
  const newGamerActions = { ...gamerActions, backed: action };
  const newActions = { ...actions, [aimed.name]: newGamerActions };
  const newBackedActions = { ...backedActions, [sender]: backed };

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      actions: newActions,
      backedActions: newBackedActions,
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // setTimeout(async () => {
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        phase: "choose",
        propositions: newPropositions,
        senders: [],
      },
    });
    // }, 2000);
  }
}

export async function sendPropositionBack({
  proposer,
  keeper,
  kept,
  backed,
  roomToken,
  gameData,
}) {
  const { actions, senders } = gameData;

  const proposerActions = actions[proposer];
  const keeperActions = actions[keeper.name];

  const newProposerActions = { ...proposerActions, proposedBack: backed };
  const newKeeperActions = { ...keeperActions, kept };
  const newActions = {
    ...actions,
    [proposer]: newProposerActions,
    [keeper.name]: newKeeperActions,
  };

  const newSenders = [...senders, keeper];

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      actions: newActions,
      senders: newSenders,
    },
  });

  if (newSenders.length === gameData.gamers.length) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // setTimeout(async () => {
    await pusher.trigger(`room-${roomToken}`, "room-event", {
      gameData: {
        ...gameData,
        phase: "finalReveal",
        actions: newActions,
        senders: newSenders,
      },
    });
    // }, 2000);
  }
}
