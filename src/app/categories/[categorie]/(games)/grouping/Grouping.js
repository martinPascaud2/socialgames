"use client";

import EndGame from "@/components/EndGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import { useEffect, useState } from "react";

export default function Grouping({
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (gameData.admin === user.name) setIsAdmin(true);
  }, [gameData.admin, user.name]);

  return (
    <>
      {gameData.ended && (
        <EndGame gameData={gameData} user={user} isFirst={true} />
      )}

      {/* check  */}
      {isAdmin && (
        <ChooseOneMoreGame
          gameData={gameData}
          roomToken={roomToken}
          isFirst={true}
          storedLocation={storedLocation}
        />
      )}
    </>
  );
}
