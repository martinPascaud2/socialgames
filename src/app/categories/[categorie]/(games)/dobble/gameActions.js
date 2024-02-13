"use server";

import pusher from "@/utils/pusher";
import prisma from "@/utils/prisma";
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
  //   if (gamers.length + guests.length + multiGuests.length < 2)
  //     return { error: "Un plus grand nombre de joueurs est requis." };
  //max number ???

  const startedRoom = await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      started: true,
      gameData: {},
    },
  });

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: startedRoom.gamers,
    guests,
    multiGuests,
  });

  if (gamersAndGuests.some((player) => player.guest))
    return { error: "Ce jeu est incompatible avec les guests monoscreen." };

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      gamers: gamersAndGuests,
    },
  });

  return {};
}

const getIconsKeys = ({ imageLength }) => {
  const randomIcons = [];
  let randomIconsNumber = 0;
  const sizesArray = [10, 15, 15, 20, 20, 20, 20, 25, 35, 35];
  // const sizesArray = [5, 5, 5, 5, 10, 10, 10, 15, 15, 20];
  let randomSizes = sizesArray.sort(() => Math.random() - 0.5);
  console.log("randomSizes", randomSizes);
  while (randomIconsNumber <= 9) {
    const randomKey = Math.floor(Math.random() * imageLength);
    if (randomIcons.some((icon) => icon.key === randomKey)) continue;
    // const randomSize = Math.floor(Math.random() * 10) + 6;
    const randomSize = randomSizes[randomIconsNumber];
    // let randomSize;
    // switch (randomIconsNumber) {
    //   case 4:
    //   case 5:
    //     randomSize = Math.floor(Math.random() * 0) + 40;
    //     break;
    //   case 0:
    //   case 1:
    //   case 2:
    //   case 7:
    //   case 3:
    //     randomSize = Math.floor(Math.random() * 0) + 10;
    //     break;
    //   case 8:
    //   case 6:
    //     randomSize = Math.floor(Math.random() * 0) + 20;
    //     break;
    //   default:
    //     break;
    // }
    // const randomSize = Math.floor((0.5 + 0.5 * Math.random()) * 65) + 60;
    const randomRotation = Math.floor(Math.random() * 360);
    randomIcons.push({
      key: randomKey,
      size: randomSize,
      rotation: randomRotation,
    });
    randomIconsNumber++;
  }

  const sameKey =
    randomIcons[Math.floor(Math.random() * randomIcons.length)].key;

  const onlyWithOne = [];
  randomIconsNumber = 0;
  randomSizes = sizesArray.sort(() => Math.random() - 0.5);
  while (randomIconsNumber <= 8) {
    const randomKey = Math.floor(Math.random() * imageLength);
    if (
      onlyWithOne.some((icon) => icon.key === randomKey) ||
      randomIcons.some((icon) => icon.key === randomKey) ||
      randomKey === sameKey
    )
      continue;
    // const randomSize = Math.floor(Math.random() * 10) + 6;
    const randomSize = randomSizes[randomIconsNumber];

    // const randomSize = Math.floor((0.5 + 0.5 * Math.random()) * 65) + 60;
    const randomRotation = Math.floor(Math.random() * 360);
    onlyWithOne.push({
      key: randomKey,
      size: randomSize,
      rotation: randomRotation,
    });
    randomIconsNumber++;
  }
  const randomSameIndex = Math.floor(Math.random() * onlyWithOne.length);
  onlyWithOne.splice(randomSameIndex, 0, {
    key: sameKey,
    // size: Math.floor(Math.random() * 10) + 6,
    size: randomSizes[9],
    // size: Math.floor((0.5 + 0.5 * Math.random()) * 65) + 60,
    rotation: Math.floor(Math.random() * 360),
  });

  return { randomIcons, onlyWithOne, sameKey };
};

export async function goFirstRound({
  roomId,
  roomToken,
  gameData,
  imageLength,
}) {
  //   const room = await prisma.room.findFirst({ where: { id: roomId } });
  // console.log("imageLength", imageLength);
  const { randomIcons, onlyWithOne, sameKey } = getIconsKeys({ imageLength });
  console.log("randomIcons", randomIcons);
  console.log("onlyWithOne", onlyWithOne);
  const newData = {
    round: {
      number: 1,
      randomIcons,
      onlyWithOne,
      sameKey,
    },
  };
  console.log("newData", newData);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      ...newData,
      rotation: { top: Math.random() < 0.5, bot: Math.random() < 0.5 },
    },
  });

  await prisma.room.update({
    where: {
      id: roomId,
    },
    data: {
      started: true,
      gameData: { ...gameData, ...newData },
    },
  });
}

export async function serverSucceed({
  roomId,
  roomToken,
  gameData,
  imageLength,
  roundNumber,
  // userId,
  user,
}) {
  const roomData = (await prisma.room.findFirst({ where: { id: roomId } }))
    .gameData;
  const { id: userId, name: userName } = user;

  //si le round est déjà passé ou déjà winner
  if (
    (roomData.recRounds && roomData.recRounds[roundNumber]?.winner) ||
    roomData.round?.number > roundNumber
  )
    return;

  const recRounds = roomData.recRounds || {};
  let newRecRounds = {};
  if (!recRounds[roundNumber]) {
    newRecRounds = {
      ...recRounds,
      [roundNumber]: { winner: userId, failers: 0 },
    };
  } else {
    const round = recRounds[roundNumber];
    const updatedRound = { ...round, winner: userId };
    newRecRounds = { ...recRounds, [roundNumber]: updatedRound };
  }

  const { randomIcons, onlyWithOne, sameKey } = getIconsKeys({ imageLength });
  const newRound = {
    number: roundNumber + 1,
    randomIcons,
    onlyWithOne,
    sameKey,
  };

  const count = roomData.count || {};
  const newPlayerCount = (count[userName] || 0) + 1;

  const newData = {
    ...roomData,
    recRounds: newRecRounds,
    round: newRound,
    count: { ...count, [userName]: newPlayerCount },
  };
  console.log("newData", newData);
  console.log("newRecRounds", newRecRounds);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      ...newData,
      rotation: { top: Math.random() < 0.5, bot: Math.random() < 0.5 },
    },
  });

  await prisma.room.update({
    where: { id: roomId },
    data: {
      gameData: newData,
    },
  });
}

const goNewLoosersRound = async ({
  roomId,
  roomToken,
  roomData,
  roundNumber,
  imageLength,
}) => {
  const { randomIcons, onlyWithOne, sameKey } = getIconsKeys({ imageLength });
  const newData = {
    ...roomData,
    round: {
      number: roundNumber + 1,
      randomIcons,
      onlyWithOne,
      sameKey,
    },
  };

  console.log("newData goNewLoosersRound", newData);

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...roomData,
      ...newData,
      rotation: { top: Math.random() < 0.5, bot: Math.random() < 0.5 },
    },
  });

  await prisma.room.update({
    where: { id: roomId },
    data: {
      gameData: newData,
    },
  });
};

export async function serverFail({
  roomId,
  roomToken,
  gameData,
  roundNumber,
  userId,
  imageLength,
}) {
  const roomData = (await prisma.room.findFirst({ where: { id: roomId } }))
    .gameData;

  console.log("roomData", roomData);

  const recRounds = roomData.recRounds || {};
  let newRecRounds = {};

  if (!recRounds[roundNumber]) {
    // const failers = recRounds[roundNumber]?.failers || 0;
    newRecRounds = {
      ...recRounds,
      [roundNumber]: { failers: 1 },
    };
    // const
    // newRecRounds = {...recRounds, [roundNumber]: }
  } else {
    const round = recRounds[roundNumber];
    const failers = round.failers || 0;
    const updatedRound = { ...round, failers: failers + 1 };
    console.log("updatedRound làlàlà", updatedRound);
    if (updatedRound.failers === roomData.gamers.length) {
      await goNewLoosersRound({
        roomId,
        roomToken,
        roomData,
        roundNumber,
        imageLength,
      });
      return;
    }
    newRecRounds = { ...recRounds, [roundNumber]: updatedRound };
    //si trop de foirages
  }

  const newData = { ...roomData, recRounds: newRecRounds };

  await prisma.room.update({
    where: { id: roomId },
    data: {
      gameData: newData,
    },
  });

  // await pusher.trigger(`room-${roomToken}`, "room-event", {
  //   gameData: {
  //     ...gameData,
  //     ...newData,
  //   },
  // });

  console.log("newRecRounds", newRecRounds);
}
