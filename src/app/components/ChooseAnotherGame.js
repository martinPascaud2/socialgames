"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { getGroup } from "./Room/actions";
import { searchGame } from "./Room/actions";

export default function ChooseAnotherGame({
  group,
  roomId,
  roomToken,
  gameData,
  lastPosition,
  deleteInvs,
  children,
}) {
  const router = useRouter();

  const returnLobby = useCallback(async () => {
    await deleteInvs();

    if (group) {
      const gamers = [...group.gamers];
      const multiGuests = [...group.multiGuests];
      const lastGame = group.lastGame;
      const viceAdmin = group.viceAdmin;
      const arrivalsOrder = group.arrivalsOrder;

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
    } else {
      const {
        gamers,
        multiGuests,
        privacy,
        lastGame,
        lastPosition,
        viceAdmin,
        arrivalsOrder,
      } = await getGroup({ roomId });

      const stored = {
        roomToken,
        gamers,
        multiGuests,
        privacy,
        lastGame,
        lastPosition,
        viceAdmin,
        arrivalsOrder,
      };
      localStorage.setItem("group", JSON.stringify(stored));
    }

    await searchGame({ gameData, roomToken });

    router.push("/categories?group=true");
  }, [gameData, roomToken, router, group, lastPosition]);

  return <button onClick={async () => await returnLobby()}>{children}</button>;
}
