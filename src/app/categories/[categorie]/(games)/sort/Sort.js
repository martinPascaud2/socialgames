"use client";

import { useState, useEffect } from "react";

import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import Disconnected from "@/components/disconnection/Disconnected";

export default function Dobble({
  roomId,
  roomToken,
  user,
  onlineGamers,
  gameData,
  storedLocation,
}) {
  const isAdmin = gameData.admin === user.name;
  const { gamers } = gameData;

  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  console.log("roomId", roomId);
  console.log("roomToken", roomToken);
  console.log("user", user);
  console.log("onlineGamers", onlineGamers);
  console.log("gameData", gameData);
  console.log("storedLocation", storedLocation);

  return (
    <div>
      <div>coucou</div>
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
        gamers={gamers}
        isAdmin={isAdmin}
        onGameBye={async () => {
          await removeGamers({
            roomId,
            roomToken,
            gameData,
            onlineGamers,
            imageLength,
          });
        }}
        modeName="sort"
        gameData={gameData}
        userId={user.id}
      />
    </div>
  );
}
