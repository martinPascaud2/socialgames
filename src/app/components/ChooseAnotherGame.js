"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { finishGame } from "@/categories/[categorie]/(games)/actionouverite/actions";

export default function ChooseAnotherGame({
  group,
  roomToken,
  gameData,
  isReturnLobby,
}) {
  const router = useRouter();

  const returnLobby = useCallback(() => {
    const gamers = [...group.gamers];
    const multiGuests = [...group.multiGuests];
    const guests = [...group.guests];

    const stored = {
      roomToken,
      gamers,
      multiGuests,
      guests,
      privacy: group.privacy,
    };
    localStorage.setItem("group", JSON.stringify(stored));

    finishGame({ gameData, roomToken });

    router.push(
      `${
        isReturnLobby
          ? "/categories/grouping/grouping"
          : "/categories?group=true"
      }`
    );
  }, [gameData, roomToken, router]);

  return (
    <button
      onClick={() => returnLobby()}
      className="border border-blue-300 bg-blue-100"
    >
      {isReturnLobby ? "Retour au lobby" : "Choisir un autre jeu"}
    </button>
  );
}
