"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import getRoomPrivacy from "@/utils/getRoomPrivacy";
import { finishGame } from "./Room/actions";

import DeleteGroup from "./DeleteGroup";

export default function ChooseOneMoreGame({
  gameData,
  roomToken,
  isFirst = false,
  storedLocation,
}) {
  const router = useRouter();
  const [privacy, setPrivacy] = useState(null);
  const path = usePathname();
  const gameName = path.split("/")[3];

  const goChooseGame = useCallback(
    (priv) => {
      const gamers = gameData.gamers.filter(
        (gamer) => !gamer.guest && !gamer.multiGuest
      );
      const multiGuests = gameData.gamers.filter((gamer) => gamer.multiGuest);
      const guests = gameData.gamers.filter((gamer) => gamer.guest);

      const group = {
        roomToken,
        gamers,
        multiGuests,
        guests,
        privacy: priv,
        lastGame: gameName,
        lastMode: { mode: gameData.options?.mode, options: gameData.options },
        lastPosition: storedLocation,
      };
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

  if (isFirst) return null;

  return (
    <>
      <div className="flex flex-col items-center">
        {privacy && (
          <div className="flex mb-4">
            <button
              onClick={() => goChooseGame(privacy)}
              className="border border-blue-300 bg-blue-100"
            >
              Retour au lobby
            </button>
          </div>
        )}
        <div>
          <DeleteGroup roomToken={roomToken} />
        </div>
      </div>
    </>
  );
}
