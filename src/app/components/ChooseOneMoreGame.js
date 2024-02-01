"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import getRoomPrivacy from "@/utils/getRoomPrivacy";
import { chooseOneMoreGame } from "@/categories/[categorie]/(games)/actionouverite/actions";

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
      chooseOneMoreGame({ gameData, roomToken });
      router.push("/categories?group=true");
    },
    [gameData.gamers, roomToken, router]
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
    <>
      <button
        onClick={() => goChooseGame("private")}
        className="absolute bottom-0 left-0 border border-blue-300 bg-blue-100"
      >
        Nouvelle partie (privée)
      </button>
      <button
        onClick={() => goChooseGame("public")}
        className="absolute bottom-0 right-0 border border-blue-300 bg-blue-100"
      >
        Nouvelle partie (publique)
      </button>
    </>
  );
}
