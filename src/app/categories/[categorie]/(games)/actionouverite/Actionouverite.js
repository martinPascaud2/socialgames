"use client";

import { triggerGameEvent } from "./gameActions";

export default function Actionouverite({
  roomId,
  roomToken,
  userName,
  gameData,
}) {
  console.log("gameData", gameData);
  console.log("roomId", roomId);
  console.log("gameData.activePlayer", gameData.activePlayer);
  console.log("userName", userName);
  //   console.log("roomToken", roomToken);

  const isActive = gameData.activePlayer === userName;

  console.log("isActive", isActive);

  const doEvent = () => {
    triggerGameEvent(roomId, roomToken, gameData);
  };
  return (
    <>
      <div>données : {JSON.stringify(gameData)}</div>

      {isActive && <button onClick={doEvent}>lancer événement</button>}
    </>
  );
}
