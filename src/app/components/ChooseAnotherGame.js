"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { finishGame } from "./Room/actions";

export default function ChooseAnotherGame({
  group,
  roomToken,
  gameData,
  lastGame,
  lastPosition,
  viceAdmin,
  arrivalsOrder,
}) {
  const router = useRouter();

  const returnLobby = useCallback(async () => {
    const gamers = [...group.gamers];
    const multiGuests = [...group.multiGuests];

    const stored = {
      roomToken,
      gamers,
      multiGuests,
      privacy: group.privacy,
      lastGame,
      lastPosition,
      viceAdmin,
      arrivalsOrder,
    };
    localStorage.setItem("group", JSON.stringify(stored));

    await finishGame({ gameData, roomToken });

    router.push("/categories?group=true");
  }, [
    gameData,
    roomToken,
    router,
    group,
    lastGame,
    lastPosition,
    viceAdmin,
    arrivalsOrder,
  ]);

  return (
    <button
      onClick={async () => await returnLobby()}
      className="border border-blue-300 bg-blue-100"
    >
      Autre jeu
    </button>
  );
}
