"use client";

import { useEffect, useState } from "react";

import TeamDrawing from "./TeamDrawing";
import ChainDrawing from "./ChainDrawing";

import FinishGame from "@/components/FinishGame";
import EndGame from "@/components/EndGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";

export default function Drawing({ roomId, roomToken, user, gameData }) {
  const mode = gameData.options?.mode;
  const isAdmin = gameData.admin === user.name;

  const [isEnded, setIsEnded] = useState(false);
  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  return (
    <>
      {mode === "team" && (
        <TeamDrawing
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          gameData={gameData}
        />
      )}

      {mode === "chain" && (
        <ChainDrawing
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          gameData={gameData}
        />
      )}

      {isAdmin ? (
        !isEnded ? (
          <FinishGame gameData={gameData} roomToken={roomToken} />
        ) : (
          <ChooseOneMoreGame gameData={gameData} roomToken={roomToken} />
        )
      ) : isEnded ? (
        <EndGame gameData={gameData} user={user} />
      ) : null}
    </>
  );
}
