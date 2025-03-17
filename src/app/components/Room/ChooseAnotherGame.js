"use client";

import { searchGame } from "./actions";

export default function ChooseAnotherGame({
  gameName,
  setShowPlayers,
  setShowConfig,
  gameData,
  roomId,
  roomToken,
  deleteInvs,
}) {
  return (
    <div
      onClick={async () => {
        await deleteInvs();
        await searchGame({ gameData, roomId, roomToken });

        setShowPlayers(true);
        setShowConfig(false);
      }}
    >
      {gameName}
    </div>
  );
}
