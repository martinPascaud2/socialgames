"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { goFirstRound, serverSucceed, serverFail } from "./gameActions";

import { XMarkIcon } from "@heroicons/react/24/outline";
import NextStep from "@/components/NextStep";
import NextEndingPossibilities from "@/components/NextEndingPossibilities";

const imageContext = require.context("./icons", false, /\.(png)$/);

const images = {};
const imagesNames = [];
let imageLength = 0;
imageContext.keys().forEach((path) => {
  const imageName = path.replace(/^\.\/(.*)\.png$/, "$1");
  !imageName.startsWith("src") &&
    (imagesNames.push(imageName),
    (images[imageName] = imageContext(path).default),
    imageLength++);
});

export default function Dobble({
  roomId,
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const isAdmin = gameData.admin === user.name;
  const [roundNumber, setRoundNumber] = useState(0);
  const [scores, setScores] = useState([]);
  const [isEnded, setIsEnded] = useState(false);
  const [locked, setLocked] = useState(false);

  const [randomIcons, setRandomIcons] = useState([]);
  const [onlyWithOne, setOnlyWithOne] = useState([]);
  const sameKey = gameData.round?.sameKey;

  useEffect(() => {
    gameData.round?.number && setRoundNumber(gameData.round.number);
  }, [gameData.round]);

  useEffect(() => {
    if (gameData.nextGame) return;

    setRandomIcons(gameData.round?.randomIcons);
    setOnlyWithOne(gameData.round?.onlyWithOne);
    setLocked(false);

    const newScores = gameData.gamers
      ?.map((gamer) => ({
        name: gamer.name,
        score: gameData.count?.[gamer.name] || 0,
      }))
      .sort((a, b) => b.score - a.score);
    setScores(newScores);
  }, [gameData.round, gameData.count, gameData.gamers, gameData.nextGame]);

  const goFail = () => {
    serverFail({
      roomId,
      roomToken,
      roundNumber,
      imageLength,
    });
  };

  const goSucceed = () => {
    serverSucceed({
      roomId,
      roomToken,
      gameData,
      imageLength,
      roundNumber,
      user,
    });
  };

  useEffect(() => {
    if (!scores) return;
    const winner = scores.find((score) => score.score === 10);
    if (winner) setIsEnded(true);
  }, [scores]);
  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  return (
    <>
      {isAdmin && roundNumber === 0 && (
        <div className="absolute bottom-0 z-10 left-1/2 translate-x-[-50%] translate-y-[-25%]">
          <NextStep
            onClick={() => {
              goFirstRound({ roomId, roomToken, gameData, imageLength });
            }}
          >
            Lancer
          </NextStep>
        </div>
      )}

      <div className="overflow-y-auto">
        <div className="flex flex-row flex-wrap justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            <div>Scores</div>
            {scores?.map((score) => (
              <div key={score.name}>
                {score.name} : {score.score}
              </div>
            ))}
          </div>

          {!isEnded ? (
            <>
              <div
                className={`w-[90vw] m-2 p-2 ${
                  randomIcons && "border"
                } flex flex-cols flex-wrap justify-around content-around ${
                  gameData.rotation?.top ? "rotate-180" : ""
                }`}
              >
                {randomIcons?.map((icon) => (
                  <Image
                    key={icon.key}
                    src={images[imagesNames[icon.key]]}
                    alt={imagesNames[icon.key]}
                    className=""
                    style={{
                      transform: `rotate(${icon.rotation}deg)`,
                      width: `${icon.size}vw`,
                      height: `${icon.size}vw`,
                    }}
                  />
                ))}
              </div>

              <div
                className={`w-[90vw] m-2 p-2 ${
                  onlyWithOne && "border"
                } flex flex-cols flex-wrap justify-around content-around ${
                  gameData.rotation?.bot ? "rotate-180" : ""
                }`}
              >
                {onlyWithOne?.map((icon) => (
                  <button
                    key={icon.key}
                    onClick={() => {
                      !locked &&
                        (sameKey === icon.key
                          ? goSucceed()
                          : (goFail(), setLocked(true)));
                    }}
                    style={{
                      transform: `rotate(${icon.rotation}deg)`,
                      width: `${icon.size}vw`,
                      height: `${icon.size}vw`,
                    }}
                    className="relative"
                  >
                    <Image
                      src={images[imagesNames[icon.key]]}
                      alt={imagesNames[icon.key]}
                      className="m-2 p-2"
                    />
                    {locked && sameKey !== icon.key && (
                      <XMarkIcon className="absolute top-[4vw] left-[4vw] text-red-600" />
                    )}
                    {locked && sameKey === icon.key && (
                      <div
                        className={`absolute top-[2vw] left-[2vw] border border-green-600 rounded-full w-full h-full`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col">
                <div>{scores[0].name} remporte la partie !</div>
              </div>
            </>
          )}
        </div>
      </div>

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
    </>
  );
}
