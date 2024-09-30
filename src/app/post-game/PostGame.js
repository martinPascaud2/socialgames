"use client";

import { useState } from "react";
import Link from "next/link";

import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import formatDate from "@/utils/formatDate";

import WrittenCard from "@/categories/[categorie]/(games)/triaction/WrittenCard";

const TriactionPG = ({ postGame, userName }) => {
  const date = formatDate(postGame.createdAt);
  const { actions } = postGame.gameData;
  const isAdmin = postGame.admin === userName;

  const [triggeredGamers, setTriggeredGamers] = useState(
    Object.keys(actions).reduce((acc, gamerName) => {
      acc[gamerName] = false;
      return acc;
    }, {})
  );

  return (
    <div className="flex flex-col items-center w-full">
      <div>{date}</div>
      <div className="flex flex-col items-center w-full">
        {Object.entries(actions).map(([gamer, actions], i) => {
          const canModify = gamer === userName || isAdmin;

          const dones = {
            backed: actions.backed.done,
            kept: actions.kept.done,
            proposedBack: actions.proposedBack.done,
          };

          const backed = {
            type: "backed",
            label: `Action renvoyée par ${actions.backed.from}`,
            action: actions.backed.action,
          };
          const kept = {
            type: "kept",
            label: `Proposition de ${actions.kept.from} acceptée`,
            action: actions.kept.action,
          };
          const proposedBack = {
            type: "proposedBack",
            label: `Proposition non acceptée par ${actions.proposedBack.from}`,
            action: actions.proposedBack.action,
          };

          return (
            <div key={i} className="flex flex-col items-center w-full">
              <button
                onClick={() =>
                  setTriggeredGamers((prevTriggered) => {
                    const newTriggered = { ...prevTriggered };
                    newTriggered[gamer] = !prevTriggered[gamer];
                    return newTriggered;
                  })
                }
                className="border border-blue-300 bg-blue-100 p-1 w-20 m-2 flex"
              >
                <div>{gamer}</div>
                <div className="ml-auto">
                  {triggeredGamers[gamer] ? (
                    <ChevronDownIcon className="h-6 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-6 w-5" />
                  )}
                </div>
              </button>

              {triggeredGamers[gamer] && (
                <>
                  <WrittenCard
                    data={backed}
                    done={dones.backed}
                    postGame={postGame}
                    gamer={gamer}
                    canModify={canModify}
                  />
                  <WrittenCard
                    data={kept}
                    done={dones.kept}
                    postGame={postGame}
                    gamer={gamer}
                    canModify={canModify}
                  />
                  <WrittenCard
                    data={proposedBack}
                    done={dones.proposedBack}
                    postGame={postGame}
                    gamer={gamer}
                    canModify={canModify}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function PostGame({ user, triaction_PG }) {
  const userParams = user.params;
  const barsSizes = {
    bottom: userParams?.bottomBarSize || 8,
    top: userParams?.topBarSize || 8,
  };

  return (
    <div className="absolute h-screen w-full z-50">
      <div className={`fixed h-${barsSizes.top} w-full z-[70] bg-black`} />
      <div
        className={`overflow-y-auto z-[60] w-full`}
        style={{
          height: `calc(100vh - ${barsSizes.top / 4 + barsSizes.top / 4}rem)`,
          marginTop: `${barsSizes.top / 4}rem`,
        }}
      >
        <div>PostGame</div>

        <div className="flex flex-col items-center w-full">
          <div>Triaction</div>
          <div className="flex flex-col items-center w-full">
            {triaction_PG.map((postGame, i) => {
              return (
                <TriactionPG key={i} postGame={postGame} userName={user.name} />
              );
            })}
          </div>
        </div>

        <Link
          href={"/categories/?control=true"}
          className="border border-blue-300 bg-blue-100 p-1"
        >
          Retour
        </Link>
      </div>
    </div>
  );
}
