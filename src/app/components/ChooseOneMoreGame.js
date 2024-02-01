"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import getRoomPrivacy from "@/utils/getRoomPrivacy";
import { finishGame } from "@/categories/[categorie]/(games)/actionouverite/actions";

export default function ChooseOneMoreGame({
  gameData,
  roomToken,
  isFirst = false,
}) {
  const router = useRouter();
  const [privacy, setPrivacy] = useState(null);

  const goChooseGame = useCallback(
    (priv) => {
      const guests = gameData.gamers.filter((gamer) => gamer.guest);
      const group = { roomToken, guests, privacy: priv };
      localStorage.setItem("group", JSON.stringify(group));
      finishGame({ gameData, roomToken });
      router.push(
        isFirst ? `/categories?group=true` : `/categories/grouping/grouping`
      );
    },
    [gameData, roomToken, router, isFirst]
  );

  useEffect(() => {
    const getPrivacy = async () => {
      const priv = (await getRoomPrivacy({ roomToken })) ? "private" : "public";
      setPrivacy(priv);
    };
    getPrivacy();

    isFirst && privacy !== null && goChooseGame(privacy);
  }, [roomToken, isFirst, privacy, goChooseGame]);

  return (
    <div className="flex justify-center">
      <button
        onClick={() => goChooseGame("private")}
        className="border border-blue-300 bg-blue-100"
      >
        Lobby privé
      </button>
      <button
        onClick={() => goChooseGame("public")}
        className="border border-blue-300 bg-blue-100"
      >
        Lobby public
      </button>
    </div>
  );
}
