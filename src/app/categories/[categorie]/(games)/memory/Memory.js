"use client";

import { useEffect, useState } from "react";

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

export default function Memory({ roomId, roomToken, user, gameData }) {
  console.log("gameData", gameData);
  const [icons, setIcons] = useState([]);
  const isAdmin = gameData.admin === user.name;
  const isActive =
    gameData.activePlayer?.id === user.id ||
    (gameData.activePlayer?.guest && isAdmin);
  const [triggeredNumber, setTriggeredNumber] = useState(0);

  useEffect(() => {
    async function initialize() {
      await getIcons({
        imageLength,
        pairsNumber: 10,
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
      }, 2000);
    }
  }, [gameData.icons]);

  const reveal = async ({ index, iconKey }) => {
    if (!isActive || triggeredNumber >= 2) return;
    setTriggeredNumber((prevTrigs) => prevTrigs + 1);
    await revealCard({ roomToken, gameData, index, iconKey });
  };

  return (
    <>
      <div>C'est au tour de {gameData.activePlayer.name}</div>
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
              reveal={reveal}
            />
          );
        })}
      </div>
    </>
  );
}
