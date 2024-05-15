"use client";

import { useEffect, useState } from "react";

import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import { getIcons, revealCard, hideUndiscovered } from "./gameActions";
import Card from "./Card";

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

export default function Memory({
  roomId,
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const [icons, setIcons] = useState([]);
  const { scores } = gameData;
  const isAdmin = gameData.admin === user.name;
  const isActive =
    gameData.activePlayer?.id === user.id ||
    (gameData.activePlayer?.guest && isAdmin);
  const [triggeredNumber, setTriggeredNumber] = useState(0);

  const [isEnded, setIsEnded] = useState(false);
  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  useEffect(() => {
    async function initialize() {
      await getIcons({
        imageLength,
        pairsNumber: gameData.options.pairsNumber,
        roomToken,
        gameData,
      });
    }
    isAdmin && !icons.length && initialize();
  }, []);

  useEffect(() => {
    gameData.icons && setIcons(gameData.icons);
  }, [gameData.icons]);

  useEffect(() => {
    const triggered = gameData.icons?.filter((icon) => icon.triggered).length;
    if (triggered >= 2) {
      setTimeout(() => {
        isActive && hideUndiscovered({ roomToken, gameData });
        setTriggeredNumber(0);
      }, 1400);
    }
  }, [gameData.icons]);

  const reveal = async ({ index, iconKey }) => {
    if (!isActive || triggeredNumber >= 2) return;
    setTriggeredNumber((prevTrigs) => prevTrigs + 1);
    await revealCard({ roomToken, gameData, index, iconKey });
  };

  return (
    <>
      <div>
        Scores
        {scores?.map((score, i) => (
          <div key={i}>
            {Object.entries(score)[0][0]} : {Object.entries(score)[0][1]}
          </div>
        ))}
      </div>
      {!isEnded && (
        <div>C&apos;est au tour de {gameData.activePlayer?.name}</div>
      )}

      <div className="flex flex-wrap justify-center">
        {icons.map((icon, i) => {
          const { triggered, discovered } = icon;
          return (
            <Card
              key={i}
              index={i}
              src={images[imagesNames[icon.key]]}
              triggered={triggered}
              discovered={discovered}
              reveal={
                !isEnded
                  ? reveal
                  : () => {
                      return;
                    }
              }
            />
          );
        })}
      </div>

      {isEnded && (
        <div className="flex flex-col">
          <EndGame gameData={gameData} user={user} />
        </div>
      )}
      {isAdmin ? (
        !isEnded ? (
          <FinishGame gameData={gameData} roomToken={roomToken} />
        ) : (
          <ChooseOneMoreGame
            gameData={gameData}
            roomToken={roomToken}
            storedLocation={storedLocation}
          />
        )
      ) : null}
    </>
  );
}
