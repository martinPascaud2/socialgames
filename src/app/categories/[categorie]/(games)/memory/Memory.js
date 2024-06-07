"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";

import { getIcons, revealCard, hideUndiscovered } from "./gameActions";
import { loadImages } from "./loadImages";

import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import Card from "./Card";
const CardMemo = React.memo(Card);

export default function Memory({
  roomId,
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const { scores } = gameData;
  const isAdmin = gameData.admin === user.name;
  const isActive =
    gameData.activePlayer?.id === user.id ||
    (gameData.activePlayer?.guest && isAdmin);

  const [images, setImages] = useState({});
  const [imagesNames, setImagesNames] = useState([]);
  const [imageLength, setImageLength] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isRevealing, setIsRevealing] = useState(false);
  const [triggeredNumber, setTriggeredNumber] = useState(0);

  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (
      !isAdmin ||
      isLoaded ||
      !gameData ||
      !gameData.options ||
      !gameData.options.themes ||
      !gameData.options.pairsNumber ||
      Object.keys(images).length ||
      imagesNames.length ||
      imageLength
    )
      return;

    const adminLoad = async () => {
      const {
        images: loadedImages,
        imagesNames: loadedImagesNames,
        imageLength: loadedImageLength,
      } = await loadImages({
        prefixes: gameData.options.themes,
        pairsNumber: gameData.options.pairsNumber,
        gameData,
        roomToken,
      });
      setImages(loadedImages);
      setImagesNames(loadedImagesNames);
      setImageLength(loadedImageLength);
    };
    adminLoad();
    setIsLoaded(true);
  }, [gameData.options]);

  useEffect(() => {
    if (isAdmin || !gameData.adminLoad) return;

    const {
      images: loadedImages,
      imagesNames: loadedImagesNames,
      imageLength: loadedImageLength,
    } = gameData.adminLoad;

    setImages(loadedImages);
    setImagesNames(loadedImagesNames);
    setImageLength(loadedImageLength);
  }, [gameData.adminLoad]);

  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  useEffect(() => {
    if (!gameData.options || !imageLength) return;

    async function initialize() {
      await getIcons({
        imageLength,
        pairsNumber: gameData.options.pairsNumber,
        roomToken,
        gameData,
      });
    }
    if (isAdmin && !initialized) {
      initialize();
      setInitialized(true);
    }
  }, [isAdmin, gameData.options, imageLength]);

  useEffect(() => {
    const triggered = gameData.icons?.filter((icon) => icon.triggered).length;
    if (triggered >= 2) {
      setTimeout(() => {
        isActive && hideUndiscovered({ roomToken, gameData });
        setTriggeredNumber(0);
      }, 1000);
    }
  }, [gameData.icons]);

  const reveal = useCallback(
    async ({ index }) => {
      if (!isActive || isRevealing || triggeredNumber >= 2) return;

      setTriggeredNumber((prevTrigs) => prevTrigs + 1);
      setIsRevealing(true);

      await revealCard({ roomToken, gameData, index });

      setTimeout(() => {
        setIsRevealing(false);
      }, 100);
    },
    [isActive, triggeredNumber, gameData, roomToken, isRevealing]
  );

  const scoresList = useMemo(
    () => (
      <div>
        Scores
        {scores?.map((score, i) => (
          <div key={i}>
            {Object.entries(score)[0][0]} : {Object.entries(score)[0][1]}
          </div>
        ))}
      </div>
    ),
    [scores]
  );

  const CardList = useCallback(() => {
    if (!gameData.icons || !Object.keys(images).length || !imagesNames.length)
      return;

    return (
      <div className="flex flex-wrap justify-center">
        {gameData?.icons?.map((icon, i) => {
          const { triggered, discovered } = icon;
          return (
            <CardMemo
              key={i}
              index={i}
              src={images[imagesNames[icon.key]]}
              triggered={triggered}
              discovered={discovered}
              isActive={isActive}
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
    );
  }, [gameData.icons, images, imagesNames, reveal]);

  return (
    <>
      {scoresList}

      {!isEnded && (
        <div>C&apos;est au tour de {gameData.activePlayer?.name}</div>
      )}

      {CardList()}

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
