"use client";

import { useState } from "react";
import Link from "next/link";

import WrittenCard from "@/categories/[categorie]/(games)/triaction/WrittenCard";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const TriactionPG = ({ postGame }) => {
  console.log("postGame", postGame);
  const date = formatDate(postGame.createdAt);
  const { actions } = postGame.gameData;
  console.log("actions", actions);

  const [triggeredGamers, setTriggeredGamers] = useState(
    Object.keys(actions).reduce((acc, gamerName) => {
      acc[gamerName] = false;
      return acc;
    }, {})
  );
  console.log("triggeredGamers", triggeredGamers);

  return (
    <div className="flex flex-col items-center w-full">
      <div>{date}</div>
      <div className="flex flex-col items-center w-full">
        {Object.entries(actions).map(([gamer, actions], i) => {
          const backed = {
            label: `Action renvoyée par ${actions.backed.from}`,
            action: actions.backed.action,
          };
          const kept = {
            label: `Proposition de ${actions.kept.from} acceptée`,
            action: actions.kept.action,
          };
          const proposedBack = {
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
                  <WrittenCard data={backed} />
                  <WrittenCard data={kept} />
                  <WrittenCard data={proposedBack} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function PostGame({ user, triaction_PG, resetPostGamesDEV }) {
  const userParams = user.params;
  const barsSizes = {
    bottom: userParams?.bottomBarSize || 8,
    top: userParams?.topBarSize || 8,
  };

  //   console.log("triaction_PG", triaction_PG);

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
            {triaction_PG.map((postGame, i) => (
              <TriactionPG key={i} postGame={postGame} />
            ))}
          </div>
        </div>
        <Link href={"/categories/?control=true"}>Retour</Link>
        {/* <button onClick={() => resetPostGamesDEV()}>Reset</button> */}
      </div>
    </div>
  );
}
