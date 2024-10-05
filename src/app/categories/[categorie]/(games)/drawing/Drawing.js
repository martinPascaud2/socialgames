"use client";

import { useEffect, useState, useCallback } from "react";

import { removeChainGamers, removeTeamGamers } from "./gameActions";

import { formatWord } from "@/utils/formatWord";
import TeamDrawing from "./TeamDrawing";
import ChainDrawing from "./ChainDrawing";
import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";

export default function Drawing({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const mode = gameData.options?.mode;
  const formattedMode = mode && formatWord(mode);
  const isAdmin = gameData.admin === user.name;

  const [isEnded, setIsEnded] = useState(false);
  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  const removeGamers = useCallback(
    ({ roomId, roomToken, gameData, onlineGamers, admins, arrivalsOrder }) => {
      switch (formattedMode) {
        case "esquisse":
          return removeChainGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            admins,
            arrivalsOrder,
          });
        case "pictionary":
          return removeTeamGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            admins,
            arrivalsOrder,
          });
      }
    },
    [formattedMode]
  );

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
          onlineGamers={onlineGamers}
          gameData={gameData}
        />
      )}

      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        roomId={roomId}
        reset={() => console.log("to be done")}
        storedLocation={storedLocation}
        user={user}
      />

      <Disconnected
        roomId={roomId}
        onlineGamers={onlineGamers}
        gamers={gameData.gamers}
        isAdmin={isAdmin}
        onGameBye={async ({ admins }) => {
          await removeGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            admins,
          });
        }}
        modeName={formattedMode}
        gameData={gameData}
        user={user}
      />
    </>
  );
}
