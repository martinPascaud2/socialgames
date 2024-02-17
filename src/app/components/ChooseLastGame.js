"use client";

import { useRouter } from "next/navigation";

import { gamesRefs } from "@/assets/globals";

export default function ChooseLastGame({ lastGame, group, roomToken }) {
  const router = useRouter();

  const goNextGame = () => {
    const nextGroup = { ...group };
    delete nextGroup.lastGame;
    nextGroup.roomToken = roomToken;

    localStorage.setItem("group", JSON.stringify(nextGroup));

    router.push(`/categories/${gamesRefs[lastGame].categorie}/${lastGame}`);
  };
  return (
    <>
      <div
        onClick={() => goNextGame()}
        className="border border-blue-300 bg-blue-100 w-fit"
      >
        Rejouer à {gamesRefs[lastGame].name}
      </div>
    </>
  );
}
