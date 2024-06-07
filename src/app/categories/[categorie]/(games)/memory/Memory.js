"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";

// import shuffleArray from "@/utils/shuffleArray";
import { getIcons, revealCard, hideUndiscovered } from "./gameActions";

import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import Card from "./Card";
const CardMemo = React.memo(Card);

import { loadImages, userLoadImages } from "./loadImages";

// const loadImages = ({ prefixes, pairsNumber }) => {
//   const imageContext = require.context("./icons", false, /\.(png)$/);
//   const images = {};
//   const imagesNames = [];
//   let imageLength = 0;

//   imageContext.keys().forEach((path) => {
//     const imageName = path.replace(/^\.\/(.*)\.png$/, "$1");
//     !imageName.startsWith("src") &&
//       (imagesNames.push(imageName),
//       (images[imageName] = imageContext(path).default),
//       imageLength++);
//   });
//   console.log("imagesNames", imagesNames);

//   const numberByTheme = Math.floor(pairsNumber / prefixes.length);
//   const remainings = {};
//   prefixes.forEach((theme) => {
//     remainings[theme] = numberByTheme;
//   });
//   console.log("remainings avant", remainings);
//   const shufflePrefixes = shuffleArray(prefixes);

//   let missings = pairsNumber % prefixes.length;
//   let index = 0;
//   while (missings > 0) {
//     remainings[shufflePrefixes[index]]++;
//     index++;
//     missings--;
//   }
//   console.log("remainings après", remainings);

//   return { images, imagesNames, imageLength };
// };

const loadImagesLegacy = ({ prefixes, pairsNumber }) => {
  console.log("coucou");
  const images = {};
  const imagesNames = [];
  let imageLength = 0;

  const numberByTheme = Math.floor(pairsNumber / prefixes.length);
  const remainings = {};
  prefixes.forEach((theme) => {
    remainings[theme] = numberByTheme;
  });
  console.log("remainings avant", remainings);
  const shufflePrefixes = shuffleArray(prefixes);

  let missings = pairsNumber % prefixes.length;
  let index = 0;
  while (missings > 0) {
    remainings[shufflePrefixes[index]]++;
    index++;
    missings--;
  }
  console.log("remainings après", remainings);

  const shuffledImageContextKeys = shuffleArray(imageContext.keys());

  console.log("imageContext.keys()", imageContext.keys());

  console.log("imageContext", imageContext);

  imageContext.keys().forEach((path) => {
    // shuffledImageContextKeys.forEach((path) => {
    const imageName = path.replace(/^\.\/(.*)\.png$/, "$1");
    // !imageName.startsWith("src") &&
    console.log("imageName", imageName);

    if (
      prefixes.some((prefix) => imageName.startsWith(prefix)) &&
      remainings[imageName.split(" ")[0]] > 0
    ) {
      imagesNames.push(imageName);
      images[imageName] = imageContext(path).default;
      remainings[imageName.split(" ")[0]]--;
      imageLength++;
    }

    // prefixes.some((prefix) => imageName.startsWith(prefix)) &&
    //   remainings[imageName.split(" ")[0]] > 0 &&
    //   // imageName.startsWith("ObjectAll") &&
    //   (imagesNames.push(imageName),
    //   (images[imageName] = imageContext(path).default),
    //   remainings[imageName.split(" ")[0]]--,
    //   imageLength++);
  });

  console.log("load images", images);
  console.log("load imagesNames", imagesNames);
  console.log("load imageLength", imageLength);

  return { images, imagesNames, imageLength };
};

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
  // const { images, imagesNames, imageLength } = useMemo(() => loadImages(prefix), [prefix]);
  // const { images, imagesNames, imageLength } = useMemo(() => {
  //   console.log("usememo");
  //   if (!gameData.options) return;

  //   return loadImages({
  //     prefixes: gameData.options.themes,
  //     pairsNumber: gameData.options.pairsNumber,
  //   });
  // }, [gameData.options.themes, gameData.options.pairsNumber]);
  const [images, setImages] = useState({});
  const [imagesNames, setImagesNames] = useState([]);
  const [imageLength, setImageLength] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [triggeredNumber, setTriggeredNumber] = useState(0);
  const [triggeredIndex, setTriggeredIndex] = useState([]);
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
      console.log("images", images);
      setImages(loadedImages);
      setImagesNames(loadedImagesNames);
      setImageLength(loadedImageLength);
    };
    adminLoad();
    // setTimeout(() => adminLoad(), 2000);
    setIsLoaded(true);
    // }, [gameData.options, isLoaded, gameData.icons]);
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
        setTriggeredIndex([]);
      }, 1000);
    }
  }, [gameData.icons]);

  const reveal = useCallback(
    async ({ index }) => {
      if (!isActive || triggeredNumber >= 2) return;
      setTriggeredNumber((prevTrigs) => prevTrigs + 1);
      setTriggeredIndex((prevTrig) => [...prevTrig, index]);
      await revealCard({ roomToken, gameData, index });
    },
    [isActive, triggeredNumber, gameData, roomToken]
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

  console.log("gameData", gameData);

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
              reveal={
                !isEnded && !triggeredIndex.some((index) => index === i)
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
  }, [gameData.icons, images, imagesNames]);

  return (
    <>
      {scoresList}
      {!isEnded && (
        <div>C&apos;est au tour de {gameData.activePlayer?.name}</div>
      )}

      {CardList()}

      {/* <div className="flex flex-wrap justify-center">
        {gameData?.icons?.map((icon, i) => {
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
      </div> */}

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
