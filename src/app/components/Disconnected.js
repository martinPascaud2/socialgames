"use client";

import { useState, useMemo, useEffect } from "react";

import convertNameListToString from "@/utils/convertNameListToString";

import { DiscoModal } from "./Modal";

export default function Disconnected({ onlineGamers, gamers }) {
  const [showDiscoModal, setShowDiscoModal] = useState(false);
  const [disconnectedList, setDisconnectedList] = useState([]);

  console.log("gamers", gamers);
  console.log("onlineGamers", onlineGamers);
  console.log("disconnectedList", disconnectedList);

  useEffect(() => {
    if (!onlineGamers || !gamers) return;
    if (onlineGamers.length !== gamers.length) {
      const disconnected = gamers
        .map((gamer) => gamer.name)
        .filter(
          (gamerName) =>
            !onlineGamers.map((online) => online.userName).includes(gamerName)
        );
      setDisconnectedList(disconnected);
      setShowDiscoModal(true);
    } else {
      setDisconnectedList([]);
      setShowDiscoModal(false);
    }
  }, [onlineGamers, gamers]);

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
    return (
      <div className="flex flex-col">
        <div className="flex justify-center w-full p-2">
          {discoList}
          {statusMessage}
        </div>
        {WaitingMessage}
      </div>
    );
  }, [disconnectedList]);

  if (!onlineGamers?.length || !gamers?.length || !disconnectedList?.length)
    return null;

  return <DiscoModal isOpen={showDiscoModal}>{Message}</DiscoModal>;
}
