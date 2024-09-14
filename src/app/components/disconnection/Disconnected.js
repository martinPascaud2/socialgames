"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLongPress, LongPressEventType } from "use-long-press";

import "./ripple.css";
import { gamesRefs } from "@/assets/globals";

import convertNameListToString from "@/utils/convertNameListToString";
import updateRoomLeavers from "./updateRoomLeavers";

import { DiscoModal } from "@/components/Modal";
import CountDown from "@/components/CountDown";

const DisconnectionRipplingButton = ({
  label,
  onLongPress,
  isValidated,
  setIsValidated,
  isActive,
}) => {
  const [longPressed, setLongPressed] = useState(false);
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
    } else setIsRippling(false);
  }, [coords]);

  useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  const callback = useCallback(async () => {
    if (longPressed) return;
    setLongPressed(true);
    setIsValidated(true);
    await onLongPress();
  }, [longPressed, onLongPress]);

  const cancel = () => {
    setLongPressed(false);
  };
  useEffect(() => {
    if (!isValidated) cancel();
  }, [isValidated, isActive]);

  const bind = useLongPress(isActive ? callback : null, {
    onStart: (e, meta) => {
      const rect = e.target.getBoundingClientRect();
      setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsRippling(true);
    },
    onFinish: (event, meta) => {
      setIsRippling(false);
    },
    onCancel: (event, meta) => {
      setIsRippling(false);
    },
    //onMove: () => console.log("Detected mouse or touch movement"),
    filterEvents: (event) => true, //check
    threshold: 2000,
    captureEvent: true,
    cancelOnMovement: false,
    cancelOutsideElement: true,
    detect: LongPressEventType.Pointer,
  });

  return (
    <button
      {...bind()}
      className={`hold-button rounded-md border-0 w-full px-6 py-4 ${
        !longPressed
          ? !isActive
            ? "bg-slate-400"
            : "bg-red-800"
          : "bg-lime-800"
      }  text-slate-100 overflow-hidden relative cursor-pointer`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isRippling && !longPressed ? (
        <span
          className="absolute w-5 h-5 bg-red-400 block border-0 rounded-full"
          style={{
            animationDuration: "10s",
            animationTimingFunction: "ease",
            animationIterationCount: "1",
            animationFillMode: "forwards",
            animationName: "ripple-effect",
            left: coords.x,
            top: coords.y,
          }}
        />
      ) : (
        ""
      )}
      <span className="content relative z-2 select-none">{label}</span>
    </button>
  );
};

const getDiscoWarningMessage = ({
  gameName,
  gameData,
  onlineGamers,
  isSeveral,
}) => {
  if (gamesRefs[gameName].limits.min > onlineGamers.length)
    return "Attention, ceci mettra fin à la partie.";

  switch (gameName) {
    default:
      return `La partie continuera sans ${!isSeveral ? "lui" : "eux"}.`;
  }
};

export default function Disconnected({
  roomId,
  onlineGamers,
  gamers,
  isAdmin,
  onGameBye,
  gameName,
  gameData,
}) {
  const [showDiscoModal, setShowDiscoModal] = useState(false);
  const [disconnectedList, setDisconnectedList] = useState([]);
  const [isValidated, setIsValidated] = useState(false);
  const [withoutLabel, setWithoutLabel] = useState("");
  const [finishCountdownDate, setFinishCountdownDate] = useState(null);

  useEffect(() => {
    if (!onlineGamers?.length || !gamers) return;
    if (onlineGamers.length !== gamers.length) {
      const onlineGamersSet = new Set(
        onlineGamers.map((online) => online.userName)
      );
      const disconnected = gamers
        .map((gamer) => gamer.name)
        .filter((gamerName) => !onlineGamersSet.has(gamerName));

      setDisconnectedList(disconnected);
      setShowDiscoModal(true);
      setIsValidated(false);
    } else {
      setDisconnectedList([]);
      setShowDiscoModal(false);
      setIsValidated(false);
    }
  }, [onlineGamers, gamers]);

  useEffect(() => {
    if (!disconnectedList.length) setFinishCountdownDate(null);
    else setFinishCountdownDate(Date.now() + 3000000);
  }, [disconnectedList]);

  useEffect(() => {
    if (!isValidated) setWithoutLabel("Reprendre sans");
    else setWithoutLabel("Le jeu reprend");
  }, [isValidated]);

  const onBye = useCallback(async () => {
    setTimeout(async () => {
      setFinishCountdownDate(null);
      setIsValidated(true);
      isAdmin &&
        (await updateRoomLeavers({ roomId, gamers, disconnectedList }));
      isAdmin && (await onGameBye());
    }, 0); //rendering cycle
  }, [roomId, updateRoomLeavers, onGameBye, gamers, disconnectedList]);

  const Message = useMemo(() => {
    if (!disconnectedList?.length) return null;
    const discoList = convertNameListToString(disconnectedList);
    const isSeveral = disconnectedList.length >= 2;
    const statusMessage = (
      <span>
        {!isSeveral ? "s'est " : "se sont "}déconnecté{!isSeveral ? "" : "s"}.
      </span>
    );
    const WaitingMessage = (
      <div className="flex justify-center w-full p-2">
        En attente de {!isSeveral ? "sa " : "leur "}reconnexion.
      </div>
    );
    const WarningMessage = (
      <div className="m-2 flex justify-center italic">
        {getDiscoWarningMessage({
          gameName,
          gameData,
          onlineGamers,
          isSeveral,
        })}
      </div>
    );
    return (
      <div className="flex flex-col">
        <div className="flex justify-center w-full">
          {discoList}
          {statusMessage}
        </div>
        {WaitingMessage}
        <div className="m-2">
          <DisconnectionRipplingButton
            label={withoutLabel}
            onLongPress={onBye}
            isValidated={isValidated}
            setIsValidated={setIsValidated}
            isActive={!!disconnectedList?.length && !isValidated && isAdmin}
          />
        </div>

        {finishCountdownDate && (
          <div className="m-2">
            <CountDown
              finishCountdownDate={finishCountdownDate}
              onTimeUp={onBye}
              label="Reprise dans"
            />
          </div>
        )}
        {WarningMessage}
      </div>
    );
  }, [
    onlineGamers,
    disconnectedList,
    withoutLabel,
    onBye,
    isValidated,
    setIsValidated,
    disconnectedList,
    finishCountdownDate,
  ]);

  if (!onlineGamers?.length || !gamers?.length || !disconnectedList?.length)
    return null;

  return <DiscoModal isOpen={showDiscoModal}>{Message}</DiscoModal>;
}
