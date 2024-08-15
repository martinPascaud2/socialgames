"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";

import {
  getIcons,
  revealCard,
  hideUndiscovered,
  prepareNewGame,
  goNewMemoryGame,
} from "./gameActions";
import { loadImages } from "./loadImages";
import { syncNewOptions } from "@/components/Room/actions";

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
  const { success, roundScores, totalScores, scoresEvolution } = gameData;
  const isAdmin = gameData.admin === user.name;
  const [isActive, setIsActive] = useState(false);

  const [images, setImages] = useState({});
  const [imagesNames, setImagesNames] = useState([]);
  const [imageLength, setImageLength] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // const [isRevealing, setIsRevealing] = useState(false);
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
        roomId,
      });

      setImages(loadedImages);
      setImagesNames(loadedImagesNames);
      setImageLength(loadedImageLength);
      setIsLoaded(true);
    };
    adminLoad();
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
  }, [gameData.adminLoad, isAdmin]);

  useEffect(() => {
    gameData.ended && setIsEnded(gameData.ended);
  }, [gameData.ended]);

  useEffect(() => {
    if (!gameData.options || !imageLength || gameData.icons?.length) return;

    async function initialize() {
      await getIcons({
        imageLength,
        pairsNumber: gameData.options.pairsNumber,
        roomToken,
        roomId,
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

    //+ triggeredNumber: no save between reveals
    if (triggered >= 2 || triggeredNumber >= 2) {
      // setIsRevealing(true);
      setTimeout(
        async () => {
          isActive && (await hideUndiscovered({ roomId, roomToken, gameData }));
        },
        !success ? 1000 : 0
      );
      setTimeout(
        () => {
          // setIsRevealing(false);
          setTriggeredNumber(0);
        },
        !success ? 2000 : 400
      );
    }
  }, [gameData.icons, isActive]);

  const reveal = useCallback(
    async ({ index }) => {
      // if (!isActive || isRevealing || triggeredNumber >= 2) return;
      if (!isActive || triggeredNumber >= 2) return;

      setTriggeredNumber((prevTrigs) => prevTrigs + 1);
      // setIsRevealing(true);

      // await revealCard({ roomToken, gameData, index });
      revealCard({ roomToken, gameData, index });

      // setIsRevealing(false);
    },
    // [isActive, triggeredNumber, gameData, roomToken, isRevealing]
    // [isActive, triggeredNumber, gameData, roomToken]
    [isActive, triggeredNumber, gameData, roomToken]
  );

  const roundScoresList = useMemo(
    () => (
      <div className="flex flex-col items-center m-2">
        Paires trouvées
        {roundScores?.map((score, i) => (
          <div key={i}>
            {Object.entries(score)[0][0]} : {Object.entries(score)[0][1]}
          </div>
        ))}
      </div>
    ),
    [roundScores]
  );
  const totalScoresList = useMemo(
    () => (
      <div className="flex flex-col items-center m-2">
        Scores
        {totalScores?.map((score, i) => {
          const [gamerName, gamerScore] = Object.entries(score)[0];
          return (
            <div key={i}>
              {gamerName} : {gamerScore}
              {scoresEvolution && scoresEvolution[gamerName]
                ? `(+${scoresEvolution[gamerName]})`
                : ""}
            </div>
          );
        })}
      </div>
    ),
    [totalScores, scoresEvolution]
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
              // isActive={isActive && !isRevealing}
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
    // }, [gameData.icons, images, imagesNames, reveal, isActive, isRevealing]);
  }, [gameData.icons, images, imagesNames, reveal, isActive]);

  const ActiveCardList = useCallback(() => {
    if (!gameData.icons || !Object.keys(images).length || !imagesNames.length)
      return;
    const icons = gameData.icons;
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
              // isActive={isActive && !isRevealing}
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
  }, [images, imagesNames, reveal, isActive]);

  const RenderedCardList = !isActive ? CardList : ActiveCardList;

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
    // setIsRevealing(false);
    setTriggeredNumber(0);
    setIsEnded(false);
    setServerMessage("");
    setNewGame(false);
  }, [newGame]);
  useEffect(() => {
    setOptions((prevOptions) => {
      const isOptionsDifferent =
        JSON.stringify(prevOptions) !== JSON.stringify(gameData.options);
      if (isOptionsDifferent) return gameData.options;
      else return prevOptions;
    });
  }, [gameData.options]);

  //sync new game options
  useEffect(() => {
    if (!isAdmin) return;
    const syncOptions = async () => {
      await syncNewOptions({ roomToken, gameData, options });
    };
    syncOptions();
  }, [options]);

  return (
    <>
      <div className="overflow-y-auto">
        {!isEnded && (
          <>
            {roundScoresList}
            <div>C&apos;est au tour de {gameData.activePlayer?.name}</div>
            {/* {CardList()} */}
            {RenderedCardList()}
          </>
        )}

        {isEnded && (
          <>
            {totalScoresList}
            <MemoryOptions
              isAdmin={isAdmin}
              options={options}
              setOptions={setOptions}
              userId={user.id}
              setServerMessage={setServerMessage}
              modeSelector={false}
            />
          </>
        )}
      </div>

      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        roomId={roomId}
        reset={async () => {
          await prepareNewGame({ roomToken, gameData });
          await goNewMemoryGame({
            userId: user.id,
            roomToken,
            gameData: { ...gameData, adminLoad: null },
            options,
          });
        }}
        storedLocation={storedLocation}
        user={user}
      />
    </>
  );
}
