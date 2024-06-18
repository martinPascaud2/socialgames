"use client";

import { useEffect, useState } from "react";

import TeamDrawing from "./TeamDrawing";
import ChainDrawing from "./ChainDrawing";
import NextEndingPossibilities from "@/components/NextEndingPossibilities";

export default function Drawing({
  roomId,
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const mode = gameData.options?.mode;
  const isAdmin = gameData.admin === user.name;

  const [isEnded, setIsEnded] = useState(false);
  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  return (
    <>
      {mode === "Pictionary" && (
        <TeamDrawing
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          gameData={gameData}
        />
      )}

      {mode === "Esquissé" && (
        <ChainDrawing
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          gameData={gameData}
        />
      )}

      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        reset={() => console.log("to be done")}
        storedLocation={storedLocation}
        user={user}
      />
    </>
  );
}
