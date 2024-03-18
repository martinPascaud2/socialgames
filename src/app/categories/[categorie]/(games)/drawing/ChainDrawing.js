"use client";

import { useEffect, useState } from "react";

export default function ChainDrawing({ roomId, roomToken, user, gameData }) {
  console.log("user", user);
  console.log("gameData", gameData);

  const { words } = gameData;

  const [wordIndex, setWordIndex] = useState();

  useEffect(() => {
    const index = user.multiGuest
      ? words.findIndex((word) => word.DCuserID === user.dataId)
      : words.findIndex((word) => word.DCuserID === user.id);
    setWordIndex(index);
  }, [words, user]);

  return (
    <>
      <div>mode chaîné</div>
    </>
  );
}
