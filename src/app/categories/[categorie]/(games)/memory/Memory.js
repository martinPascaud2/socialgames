"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";

import { getIcons, revealCard, hideUndiscovered } from "./gameActions";
import { loadImages } from "./loadImages";
import { prepareNewGame, goNewMemoryGame } from "./gameActions";

import Card from "./Card";
const CardMemo = React.memo(Card);
import NextEndingPossibilities from "@/components/NextEndingPossibilities";
import MemoryOptions from "./Options";

export default function Memory({
  roomId,
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const { scores } = gameData;
  const isAdmin = gameData.admin === user.name;
  const [isActive, setIsActive] = useState(false);

  const [images, setImages] = useState({});
  const [imagesNames, setImagesNames] = useState([]);
  const [imageLength, setImageLength] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isRevealing, setIsRevealing] = useState(false);
  const [triggeredNumber, setTriggeredNumber] = useState(0);

  const [isEnded, setIsEnded] = useState(false);
  const [options, setOptions] = useState(gameData.options);
  const [serverMessage, setServerMessage] = useState("");
  const [newGame, setNewGame] = useState(false);

  useEffect(() => {
    if (!gameData) return;

    if (
      (gameData.activePlayer?.id === user.id ||
        (gameData.activePlayer?.guest && isAdmin)) &&
      triggeredNumber < 2
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [gameData.activePlayer, triggeredNumber, isAdmin]);

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
    gameData.ended && setIsEnded(gameData.ended);
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
      setIsRevealing(true);
      setTimeout(async () => {
        isActive && (await hideUndiscovered({ roomToken, gameData }));
      }, 1000);
      setTimeout(() => {
        setTriggeredNumber(0);
        setIsRevealing(false);
      }, 1200);
    }
  }, [gameData.icons, isActive]);

  const reveal = useCallback(
    async ({ index }) => {
      if (!isActive || isRevealing || triggeredNumber >= 2) return;

      setTriggeredNumber((prevTrigs) => prevTrigs + 1);
      setIsRevealing(true);

      await revealCard({ roomToken, gameData, index });

      setTimeout(() => {
        setIsRevealing(false);
      }, 300);
    },
    [isActive, triggeredNumber, gameData, roomToken, isRevealing]
  );

  const scoresList = useMemo(
    () => (
      <div className="flex flex-col items-center m-2">
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
              isActive={isActive && !isRevealing}
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
  }, [gameData.icons, images, imagesNames, reveal, isActive, isRevealing]);

  useEffect(() => {
    setNewGame(gameData.newGame);
  }, [gameData.newGame]);
  useEffect(() => {
    if (!newGame) return;
    setIsActive(false);
    setImages({});
    setImagesNames([]);
    setImageLength(0);
    setInitialized(false);
    setIsLoaded(false);
    setIsRevealing(false);
    setTriggeredNumber(0);
    setIsEnded(false);
    setServerMessage("");
    setNewGame(false);
  }, [newGame]);
  useEffect(() => {
    setOptions(gameData.options);
  }, [gameData.options]);

  return (
    <>
      <div className="overflow-y-auto">
        {scoresList}

        {!isEnded && (
          <>
            <div>C&apos;est au tour de {gameData.activePlayer?.name}</div>
            {CardList()}
          </>
        )}

        {isEnded && isAdmin && (
          <MemoryOptions
            setOptions={setOptions}
            lastMode={{ mode: options?.mode, options }}
            setServerMessage={setServerMessage}
          />
        )}
      </div>
      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        reset={async () => {
          await prepareNewGame({ roomToken, gameData });
          await goNewMemoryGame({ roomToken, gameData, options });
        }}
        storedLocation={storedLocation}
        user={user}
      />
    </>
  );
}
