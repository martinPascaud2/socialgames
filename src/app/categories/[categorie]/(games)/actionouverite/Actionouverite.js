"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import classNames from "classnames";

import { triggerGameEvent } from "./gameActions";

export default function Actionouverite({ roomId, roomToken, user, gameData }) {
  const [isFirstRender, setIsFirstRender] = useState(true);

  const [newCard, setNewCard] = useState(null);
  const [oldCard, setOldCard] = useState(null);

  const [triggerReveal, setTriggerReveal] = useState(false);
  const [triggerTranslateOld, setTriggerTranslateOld] = useState(false);

  const isActive = gameData.activePlayer === user.id;

  console.log("gameData.remain.actionRemain", gameData?.remain?.actionRemain);
  console.log("gameData.remain.veriteRemain", gameData?.remain?.veriteRemain);
  console.log("gameData.secondRemain.action", gameData?.secondRemain?.action);
  console.log("gameData.secondRemain.verite", gameData?.secondRemain?.verite);

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

  const takeAction = useCallback(async () => {
    await triggerGameEvent(roomId, roomToken, gameData, "action");
  }, [gameData, roomId, roomToken]);

  const takeVerite = useCallback(async () => {
    await triggerGameEvent(roomId, roomToken, gameData, "verite");
  }, [gameData, roomId, roomToken]);

  return (
    <>
      <div>token : {roomToken}</div>
      <div className="absolute z-10">
        <div className="playing-card bg-transparent w-60 h-80 inline-block m-2.5 perspective-10">
          <div
            className={classNames(
              `flip-card relative w-full h-full rounded-2xl	border-2 transition-transform duration-1000 transform-style-3d rotate-y-[-180deg] ${
                triggerTranslateOld && oldCard
                  ? "transition-transform translate-x-72 duration-700 ease-in-out"
                  : "collapse"
              }`
            )}
          >
            <div
              className={`card-front absolute w-full h-full rounded-2xl backface-hidden bg-yellow-500 rotate-y-[180deg]`}
            >
              {oldCard?.title}
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
              {newCard?.title}
            </div>
            <div className="card-back absolute w-full h-full rounded-2xl backface-hidden bg-red-500">
              dos de carte
            </div>
          </div>
        </div>
      </div>

      {isActive && (
        <>
          <button onClick={takeAction} className="absolute left-20 bottom-80">
            Action
          </button>
          <button onClick={takeVerite} className="absolute right-20 bottom-80">
            Vérité
          </button>
        </>
      )}
    </>
  );
}
