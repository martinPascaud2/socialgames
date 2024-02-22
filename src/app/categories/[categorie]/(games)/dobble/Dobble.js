"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { goFirstRound, serverSucceed, serverFail } from "./gameActions";

import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import { XMarkIcon } from "@heroicons/react/24/outline";

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

export default function Dobble({ roomId, roomToken, user, gameData }) {
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
      .map((gamer) => ({
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
    const winner = scores.find((score) => score.score === 10);
    if (winner) setIsEnded(true);
  }, [scores]);
  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  return (
    <div className="flex flex-row flex-wrap justify-center">
      <div className="w-full flex flex-col items-center justify-center">
        <div>Scores</div>
        {scores.map((score) => (
          <div key={score.name}>
            {score.name} : {score.score}
          </div>
        ))}
      </div>

      {!isEnded ? (
        <>
          <div
            className={`w-[90vw] m-2 p-2 border flex flex-cols flex-wrap  justify-around content-around ${
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
            className={`w-[90vw] m-2 p-2 border flex flex-cols flex-wrap  justify-around content-around ${
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
            <EndGame gameData={gameData} user={user} />
          </div>
        </>
      )}

      {isAdmin && roundNumber === 0 && (
        <button
          onClick={() => {
            goFirstRound({ roomId, roomToken, gameData, imageLength });
          }}
          className="border border-blue-300 bg-blue-100"
        >
          Tout le monde est prêt ?
        </button>
      )}

      {isAdmin ? (
        !isEnded ? (
          <FinishGame gameData={gameData} roomToken={roomToken} />
        ) : (
          <ChooseOneMoreGame gameData={gameData} roomToken={roomToken} />
        )
      ) : null}
    </div>
  );
}
