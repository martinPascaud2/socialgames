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

  const counts = {};
  Object.keys(teams).forEach(
    (teamKey) => (counts[teamKey] = { votes: [], points: 0 })
  );

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
    gameData: {
      admin: startedRoom.admin,
      gamers: gamersAndGuests,
      teams,
      counts,
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

const removeAccents = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const formatWord = (guess) => {
  const lower = guess.toLowerCase();
  const trim = lower.trim();
  const noAccent = removeAccents(trim);

  return noAccent;
};

const compareWords = (word1, word2) => {
  const formatted1 = formatWord(word1);
  const formatted2 = formatWord(word2);

  if (formatted1 === formatted2) return true;
  return false;
};

const getNextDrawers = ({ teams, activePlayers }) => {
  const drawers = [];
  Object.entries(teams).forEach((team) => {
    const drawerIndex = team[1].findIndex(
      (mate) => !activePlayers.some((active) => active.id === mate.id)
    );
    const drawer = { team: team[0], index: drawerIndex };
    drawers.push(drawer);
  });

  const nextDrawers = [];
  drawers.forEach((drawer) => {
    const nextDrawerIndex = (drawer.index + 1) % teams[drawer.team].length;
    const nextDrawer = {
      ...teams[drawer.team][nextDrawerIndex],
      team: drawer.team,
    };
    nextDrawers.push(nextDrawer);
  });

  return nextDrawers;
};

export async function guessWord(
  userTeam,
  gameData,
  roomToken,
  prevState,
  formData
) {
  const guess = formData.get("guess");
  const { activePlayers, word, teams, counts } = gameData;
  const isRightAnswer = compareWords(guess, word);
  const teamCount = counts[userTeam];

  const newVotes = [...teamCount.votes, isRightAnswer ? true : false];
  const newTeamCount = { ...teamCount, votes: newVotes };

  let newCounts;
  if (newVotes.length === gameData.teams[userTeam].length - 1) {
    const isPoint = newVotes.some((vote) => vote);
    const newPoints = isPoint ? teamCount.points + 1 : teamCount.points;
    newTeamCount.points = newPoints;
  } else {
    // newCounts = { ...counts, [userTeam]: newTeamCount };
    // nextPhase = "searching";
  }

  newCounts = { ...counts, [userTeam]: newTeamCount };

  const nextPhase =
    Object.values(newCounts).reduce(
      (total, { votes }) => total + votes.length,
      0
    ) ===
    Object.values(teams).reduce((acc, team) => acc + team.length, 0) -
      Object.keys(teams).length
      ? "waiting"
      : "searching";

  console.log("nextPhase", nextPhase);

  let newActivePlayers = [];
  if (nextPhase === "waiting") {
    Object.entries(newCounts).forEach(
      (count) => (newCounts[count[0]].votes = [])
    );
    newActivePlayers = getNextDrawers({ teams, activePlayers });
  } else {
    newActivePlayers = activePlayers;
  }

  //activeplayers
  //alreadysent ?
  //counts votes

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    gameData: {
      ...gameData,
      phase: nextPhase,
      counts: newCounts,
      activePlayers: newActivePlayers,
      lastWord: word, //only used in waiting phase
    },
  });
}
