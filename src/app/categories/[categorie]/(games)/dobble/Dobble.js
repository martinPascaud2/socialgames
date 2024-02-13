"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { goFirstRound, serverSucceed, serverFail } from "./gameActions";

import { XMarkIcon } from "@heroicons/react/24/outline";

const imageContext = require.context("./icons", false, /\.(png)$/);

const images = {};
const imagesNames = [];
let imageLength = 0;

imageContext.keys().forEach((path) => {
  const imageName = path.replace(/^\.\/(.*)\.png$/, "$1");
  //   const imageName = path.match(/^\.\/(.*)\.png$/, "$1");
  !imageName.startsWith("src") &&
    (imagesNames.push(imageName),
    (images[imageName] = imageContext(path).default),
    imageLength++);
  //   console.log("imageName interne", imageName);
});

console.log("images", images);
console.log("imagesNames", imagesNames);
console.log("imageLength", imageLength);

export default function Dobble({ roomId, roomToken, user, gameData }) {
  console.log("roomId", roomId);
  console.log("roomToken", roomToken);
  console.log("user", user);
  console.log("gameData", gameData);
  const isAdmin = gameData.admin === user.name;
  const [initialized, setInitialized] = useState(false); //utiliser round
  const [roundNumber, setRoundNumber] = useState(0);
  const [randomIcons, setRandomIcons] = useState([]);
  const [onlyWithOne, setOnlyWithOne] = useState([]);
  const [nope, setNope] = useState(false);
  const [locked, setLocked] = useState(false);
  const sameKey = gameData.round?.sameKey;

  // useEffect(() => {
  //   if (isAdmin) console.log("initialisation");
  // }, []);

  useEffect(() => {
    gameData.round?.number && setRoundNumber(gameData.round.number);
  }, [gameData.round]);

  const [time, setTime] = useState();

  const getTime = () => {
    const date = new Date().getTime();
    setTime(date);
  };

  useEffect(() => {
    setRandomIcons(gameData.round?.randomIcons);
    setOnlyWithOne(gameData.round?.onlyWithOne);
    setLocked(false);
    setNope(false);
  }, [gameData.round]);

  console.log("time", time, typeof time);
  console.log("randomIcons", randomIcons);
  console.log("onlyWithOne", onlyWithOne);
  console.log("roundNumber", roundNumber);

  const goFail = () => {
    console.log("fail noob");
    serverFail({
      roomId,
      roomToken,
      gameData,
      roundNumber,
      userId: user.id,
      imageLength,
    });
  };

  const goSucceed = () => {
    console.log("gg");
    serverSucceed({
      roomId,
      roomToken,
      gameData,
      imageLength,
      roundNumber,
      // userId: user.id,
      user,
    });
  };

  console.log("locked", locked);

  return (
    <div className="flex flex-row flex-wrap justify-center">
      {/* {Object.keys(images).map((imageName, i) => (
        <Image key={i} src={images[imageName]} alt={imageName} width={50} />
      ))}
      <Image src={images["anchor"]} alt="dobble icon" width={50} /> */}
      {/* <button onClick={() => getTime()}>Date</button> */}
      {/* <div className="m-4 p-2 border columns-3">
        {randomIcons?.map((icon, index) => (
          <div
            key={icon.key}
            className="flex justify-center items-center"
            // style={{
            //   left: `calc(50% - ${
            //     100 * Math.cos((2 * Math.PI * index) / 9)
            //   }px)`,
            //   top: `calc(50% - ${100 * Math.sin((2 * Math.PI * index) / 9)}px)`,
            // }}
          >
            <Image
              src={images[imagesNames[icon.key]]}
              alt={imagesNames[icon.key]}
              // width={50}
              width={icon.size}
              // height={50}
              height={icon.size}
              className="p-2"
              style={{ transform: `rotate(${icon.rotation}deg)` }}
            />
          </div>
        ))}
      </div> */}

      {/* <div className="m-4 p-2 border columns-3 content-center"> */}
      {/* <div className="m-4 p-2 border columns-3 rotate-180	">
        {onlyWithOne?.map((icon, index) => (
          <div
            key={icon.key}
            // className="w-1/3 flex justify-center items-center"
            className="flex justify-center items-center"
            // style={{
            //   left: `calc(50% - ${
            //     100 * Math.cos((2 * Math.PI * index) / 9)
            //   }px)`,
            //   top: `calc(50% - ${100 * Math.sin((2 * Math.PI * index) / 9)}px)`,
            // }}
          >
            <Image
              src={images[imagesNames[icon.key]]}
              alt={imagesNames[icon.key]}
              // width={150}
              width={icon.size}
              // height={150}
              height={icon.size}
              // className="p-2 translate-x-1/2"
              className="p-2"
              style={{ transform: `rotate(${icon.rotation}deg)` }}
            />
          </div>
        ))}
      </div> */}

      {/* <div className="m-2 p-0 border h-[47vh] flex flex-cols flex-wrap justify-around content-around"> */}
      <div
        className={`w-[90vw] m-2 p-2 border flex flex-cols flex-wrap  justify-around content-around ${
          gameData.rotation?.top ? "rotate-180" : ""
        }`}
      >
        {/* <div className="m-2 p-1 border h-[47vh] w-[96vw] flex flex-cols flex-wrap justify-between content-between rotate-180"> */}
        {/* <div className="m-2 p-0 border max-h-[47vh] w-[96vw] columns-3 justify-center content-center "> */}
        {randomIcons?.map((icon) => (
          <Image
            key={icon.key}
            src={images[imagesNames[icon.key]]}
            alt={imagesNames[icon.key]}
            // width={icon.size}
            // height={icon.size}
            className=""
            // style={{ transform: `rotate(${icon.rotation}deg)` }}
            style={{
              transform: `rotate(${icon.rotation}deg)`,
              width: `${icon.size}vw`,
              height: `${icon.size}vw`,
            }}
          />
        ))}
      </div>

      {nope && <div>Nope</div>}

      {/* <div className="m-2 p-0 border h-[47vh] w-[96vw] flex flex-cols flex-wrap justify-around content-around rotate-180"> */}
      <div
        className={`w-[90vw] m-2 p-2 border flex flex-cols flex-wrap  justify-around content-around ${
          gameData.rotation?.bot ? "rotate-180" : ""
        }`}
      >
        {/* <div className="m-2 p-1 border h-[47vh] relative"> */}
        {/* <div className="m-2 p-0 border h-[47vh] columns-auto  rotate-180"> */}
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
            {/* {sameKey === icon.key && <div>coucou</div>} */}
            <Image
              src={images[imagesNames[icon.key]]}
              alt={imagesNames[icon.key]}
              // width={icon.size}
              // height={icon.size}
              className="m-2 p-2"
              // style={{
              //   transform: `rotate(${icon.rotation}deg)`,
              //   width: `${icon.size}vh`,
              //   height: `${icon.size}vh`,
              // }}
            />
            {locked && sameKey !== icon.key && (
              <XMarkIcon
                // style={{
                //   position: "absolute",
                //   top: "4vw",
                //   left: `4vw`,
                // }}
                className="absolute top-[4vw] left-[4vw] text-red-600"
              />
            )}
            {locked && sameKey === icon.key && (
              <div
                className={`absolute top-[2vw] left-[2vw] border border-green-600 rounded-full w-full h-full`}
              />
            )}

            {/* <div className="absolute top-1/2 left-1/2">X</div> */}
          </button>
        ))}
      </div>

      {/* <Image src={dolphin} alt="dobble icon" width={50} /> */}
      {isAdmin && roundNumber === 0 && (
        <button
          onClick={() => {
            goFirstRound({ roomId, roomToken, gameData, imageLength });
            // setInitialized(true);
          }}
          className="border border-blue-300 bg-blue-100"
        >
          Tout le monde est prêt ?
        </button>
      )}
    </div>
  );
}
