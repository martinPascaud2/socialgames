"use client";

import EndGame from "@/components/EndGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import { useEffect, useState } from "react";

export default function Grouping({ roomId, roomToken, user, gameData }) {
  //   const isAdmin = gameData.admin === user.name;

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (gameData.admin === user.name) setIsAdmin(true);
  }, [gameData.admin, user.name]);

  console.log("grouping", gameData, user);

  return (
    <>
      {gameData.ended && <EndGame />}
      {isAdmin && (
        <ChooseOneMoreGame
          gameData={gameData}
          roomToken={roomToken}
          isFirst={true}
        />
      )}
    </>
  );
}
