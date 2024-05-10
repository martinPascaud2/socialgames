"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { finishGame } from "./Room/actions";

export default function ChooseAnotherGame({
  group,
  roomToken,
  gameData,
  isReturnLobby,
  lastGame,
}) {
  const router = useRouter();

  const returnLobby = useCallback(async () => {
    const gamers = [...group.gamers];
    const multiGuests = [...group.multiGuests];
    const guests = [...group.guests];

    const stored = {
      roomToken,
      gamers,
      multiGuests,
      guests,
      privacy: group.privacy,
      lastGame,
    };
    localStorage.setItem("group", JSON.stringify(stored));

    await finishGame({ gameData, roomToken });

    router.push(
      `${
        isReturnLobby
          ? "/categories/grouping/grouping"
          : "/categories?group=true"
      }`
    );
  }, [gameData, roomToken, router, group, isReturnLobby, lastGame]);

  return (
    <button
      onClick={async () => await returnLobby()}
      className="border border-blue-300 bg-blue-100"
    >
      {isReturnLobby ? "Retour au lobby" : "Choisir un autre jeu"}
    </button>
  );
}
