"use server";

import prisma from "@/utils/prisma";

import checkPlayers from "@/utils/checkPlayers";
import { initGamersAndGuests } from "@/utils/initGamersAndGuests";
import checkViceAdminAndArrivals from "@/utils/checkViceAdminAndArrivals";
import { saveAndDispatchData } from "@/components/Room/actions";

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
    mode: options.mode,
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
  const { newViceAdmin: viceAdmin, arrivalsOrder } =
    await checkViceAdminAndArrivals({
      roomId,
      admin: startedRoom.admin,
      viceAdmin: startedRoom.viceAdmin,
      gamersAndGuests,
    });

  const newData = {
    admin: startedRoom.admin,
    viceAdmin,
    arrivalsOrder,
    gamers: gamersAndGuests,
    options,
    phase: "preparing",
  };
  await saveAndDispatchData({ roomId, roomToken, newData });

  await pusher.trigger(`room-${roomToken}`, "room-event", {
    started: startedRoom.started,
  });

  return {};
}

export async function toggleTarget({ gameData, roomId, roomToken }) {
  const { target } = gameData.options;
  const newTarget = target === "players" ? "others" : "players";
  const newOptions = { ...gameData.options, target: newTarget };
  const newData = { ...gameData, options: newOptions };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function addTheme(
  { gameData, roomId, roomToken },
  prevState,
  formData
) {
  const theme = formData.get("theme");

  const { target } = gameData.options;
  let newPhase;
  if (target === "players") newPhase = "turn";
  else newPhase = "preparing";

  const newData = {
    ...gameData,
    theme,
    phase: newPhase,
  };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function addObject(
  { objectNumber, gameData, roomId, roomToken },
  prevState,
  formData
) {
  const object = formData.get("object");
  const { objects } = gameData;
  const newObjects = {
    ...objects,
    [objectNumber]: object,
  };

  const newPhase = objectNumber === 8 ? "preturn" : "preparing";

  const newData = { ...gameData, objects: newObjects, phase: newPhase };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function goPreTurnFast({ gameData, roomId, roomToken }) {
  const newPhase = "preturn";
  const newData = { ...gameData, phase: newPhase };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function adminEditing({ type, objectKey, roomId, roomToken }) {
  const gameData = (
    await prisma.room.findFirst({
      where: { id: roomId },
      select: { gameData: true },
    })
  ).gameData;
  const newData = { ...gameData, adminEdition: { type, objectKey } };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function editValues(
  { gameData, roomId, roomToken },
  prevState,
  formData
) {
  const type = formData.get("type");
  const newValue = formData.get("newValue");

  const newAdminEdition = { type: "", objectKey: {} };

  if (type === "theme") {
    const newData = {
      ...gameData,
      theme: newValue,
      adminEdition: newAdminEdition,
    };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }

  if (type === "objects") {
    const objectKey = formData.get("objectKey");
    const { objects } = gameData;
    const newObjects = { ...objects, [objectKey]: newValue };
    const newData = {
      ...gameData,
      objects: newObjects,
      adminEdition: newAdminEdition,
    };
    await saveAndDispatchData({ roomId, roomToken, newData });
  }
}

export async function goTurnPhase({ gameData, roomId, roomToken }) {
  const newPhase = "turn";
  const newData = { ...gameData, phase: newPhase };
  await saveAndDispatchData({ roomId, roomToken, newData });
}

export async function removePodiumGamers({
  roomId,
  roomToken,
  gameData,
  onlineGamers,
  admins,
  arrivalsOrder,
}) {
  const { gamers } = gameData;

  const onlineGamersList = onlineGamers.map((gamer) => gamer.userName);
  const onlineGamersSet = new Set(onlineGamersList);

  const remainingGamers = gamers.filter((gamer) =>
    onlineGamersSet.has(gamer.name)
  );

  const newData = {
    ...gameData,
    gamers: remainingGamers,
    admin: admins.newAdmin,
    viceAdmin: admins.newViceAdmin,
    arrivalsOrder,
    //   isDeletedUser: true,
  };

  await saveAndDispatchData({ roomId, roomToken, newData });
}
