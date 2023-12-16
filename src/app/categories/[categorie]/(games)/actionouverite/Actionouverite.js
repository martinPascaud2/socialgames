"use client";

import { useEffect, useState, useRef } from "react";

import classNames from "classnames";

import { triggerGameEvent } from "./gameActions";

export default function Actionouverite({
  roomId,
  roomToken,
  userName,
  gameData,
}) {
  const [isFirstRender, setIsFirstRender] = useState(true);

  const [newCard, setNewCard] = useState(null);
  const [oldCard, setOldCard] = useState(null);

  const [triggerReveal, setTriggerReveal] = useState(false);
  const [triggerTranslateOld, setTriggerTranslateOld] = useState(false);

  const isActive = gameData.activePlayer === userName;

  console.log("gameData", gameData);

  useEffect(() => {
    if (!isFirstRender) {
      setNewCard(gameData.card);
      setOldCard(newCard);

      setTriggerTranslateOld(true);
      setTriggerReveal(false);

      const timeout = setTimeout(() => {
        setTriggerReveal(true);
        setTriggerTranslateOld(false);
      }, 700);
      return () => {
        clearTimeout(timeout);
      };
    } else {
      setIsFirstRender(false);
    }
  }, [gameData.card]);

  const doEvent = async () => {
    await triggerGameEvent(roomId, roomToken, gameData);
  };

  return (
    <>
      <div>token : {roomToken}</div>
      <div>données : {JSON.stringify(gameData)}</div>

      <div className="absolute z-10">
        <div className="playing-card bg-transparent w-60 h-80 inline-block m-2.5 perspective-10">
          <div
            className={classNames(
              `flip-card relative w-full h-full rounded-2xl	border-2 transition-transform duration-1000 transform-style-3d rotate-y-[-180deg] ${
                triggerTranslateOld
                  ? "transition-transform translate-x-72 duration-700 ease-in-out"
                  : "collapse"
              }`
            )}
          >
            <div className="card-front absolute w-full h-full rounded-2xl backface-hidden bg-yellow-500 rotate-y-[180deg]">
              recto ancienne carte : {oldCard}
            </div>
            <div className="card-back absolute w-full h-full rounded-2xl backface-hidden bg-red-500"></div>
          </div>
        </div>
      </div>

      <div className="absolute z-0">
        <div className="playing-card bg-transparent	w-60 h-80 inline-block m-2.5 perspective-10">
          <div
            className={classNames(
              `flip-card relative w-full h-full rounded-2xl	border-2 ${
                triggerReveal
                  ? "transition-transform duration-1000 transform-style-3d rotate-y-[-180deg]"
                  : ""
              }`
            )}
          >
            <div className="card-front absolute w-full h-full rounded-2xl backface-hidden bg-yellow-500 rotate-y-[180deg]">
              recto nouvelle carte : {newCard}
            </div>
            <div className="card-back absolute w-full h-full rounded-2xl backface-hidden bg-red-500">
              dos de carte
            </div>
          </div>
        </div>
      </div>

      {isActive && (
        <button onClick={doEvent} className="absolute bottom-80">
          lancer événement
        </button>
      )}
    </>
  );
}
