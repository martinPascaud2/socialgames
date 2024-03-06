"use server";

import { makeTeams, makeMinimalTeams } from "@/utils/makeTeams";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";

export async function launchGame({
  roomId,
  roomToken,
  adminId,
  //   gamers,
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

  const gamersAndGuests = initGamersAndGuests({
    adminId,
    gamers: startedRoom.gamers,
    guests,
    multiGuests,
  });

  const { error, teams } =
    options.teamMode === "teamNumber"
      ? makeTeams({
          gamersList: gamersAndGuests,
          teamsNumber: options.teamsNumber,
        })
      : makeMinimalTeams({
          gamersList: gamersAndGuests,
          minByTeam: options.minByTeam,
        });
  if (error) return { error };

  const activePlayers = Object.entries(teams).map((team) => ({
    ...team[1][0],
    team: team[0],
  }));

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      teams,
      activePlayers,
      phase: "waiting",
      options,
    },
  });

  return {};
}

const getFreeWord = async ({ roomId }) => {
  const gamers = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gamers: true },
    })
  ).gamers;

  const userIds = Object.values(gamers);

  const alreadyWords = await prisma.drawingWordsOnUsers.findMany({
    where: { userId: { in: userIds } },
    select: { drawingWordId: true },
  });
  const alreadyWordsIds = [
    ...new Set(alreadyWords.map((word) => word.drawingWordId)),
  ];

  let freeWord = await prisma.drawingWord.findFirst({
    where: {
      NOT: {
        id: { in: alreadyWordsIds },
      },
    },
  });
  if (!freeWord) {
    await prisma.drawingWordsOnUsers.deleteMany({
      where: {
        userId: { in: userIds },
      },
    });
    freeWord = await prisma.drawingWord.findFirst({
      where: {},
    });
  }
  const freeWordId = freeWord.id;

  await Promise.all(
    userIds.map(async (userId) => {
      await prisma.drawingWordsOnUsers.create({
        data: {
          user: { connect: { id: userId } },
          drawingWord: { connect: { id: freeWordId } },
        },
      });
    })
  );

  return freeWord.word;
};

export async function startDrawing({ roomId, roomToken, gameData }) {
  const freeWord = await getFreeWord({ roomId });
  console.log("freeWord", freeWord);

  const finishCountdownDate = Date.now() + gameData.options.countDownTime;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "drawing",
      word: freeWord,
      finishCountdownDate,
    },
  });
}

export async function sendImage({
  imgData,
  roomId,
  roomToken,
  gameData,
  user,
}) {
  const roomData =
    (await prisma.room.findFirst({ where: { id: roomId } })).gameData || {};

  const pngs = roomData.pngs || {};

  await prisma.user.update({
    where: { id: user.id },
    data: { png: imgData },
  });

  const alreadySent = gameData.alreadySent || 0;
  const newAlreadySent = alreadySent + 1;

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      alreadySent: newAlreadySent,
      phase:
        newAlreadySent !== gameData.activePlayers.length &&
        gameData.phase !== "sending"
          ? "drawing"
          : "sending",
    },
  });
}

export async function getPng({ activePlayers, userTeam }) {
  const mate = activePlayers.find((active) => active.team === userTeam);
  const png = (
    await prisma.user.findFirst({
      where: { id: mate.id },
      select: { png: true },
    })
  ).png;

  return png;
}

export async function goSearch({ roomToken, gameData }) {
  const { activePlayers, teams } = gameData;

  const activeIds = activePlayers.map((active) => active.id);
  const newActivePlayers = Object.entries(teams)
    .map((team) => team[1].map((gamer) => ({ ...gamer, team: team[0] })))
    .flat()
    .filter((g) => !activeIds.some((id) => g.id === id));

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: "searching",
      activePlayers: newActivePlayers,
      alreadySent: 0,
    },
  });
}

export async function guessWord(prevState, formData) {
  const guess = formData.get("guess");
  console.log("guess", guess);
}
