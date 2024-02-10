"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { goFirstRound } from "./gameActions";

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
  const [initialized, setInitialized] = useState(false);
  const [randomIcons, setRandomIcons] = useState([]);
  const [onlyWithOne, setOnlyWithOne] = useState([]);

  useEffect(() => {
    if (isAdmin) console.log("initialisation");
  }, []);

  const [time, setTime] = useState();

  const getTime = () => {
    const date = new Date().getTime();
    setTime(date);
  };

  useEffect(() => {
    setRandomIcons(gameData.randomIcons);
    setOnlyWithOne(gameData.onlyWithOne);
  }, [gameData]);

  console.log("time", time, typeof time);

  return (
    <>
      {Object.keys(images).map((imageName, i) => (
        <Image key={i} src={images[imageName]} alt={imageName} width={50} />
      ))}
      <Image src={images["anchor"]} alt="dobble icon" width={50} />
      <button onClick={() => getTime()}>Date</button>
      {/* <Image src={dolphin} alt="dobble icon" width={50} /> */}
      {isAdmin && !initialized && (
        <button
          onClick={() => {
            goFirstRound({ roomId, roomToken, gameData, imageLength });
            setInitialized(true);
          }}
          className="border border-blue-300 bg-blue-100"
        >
          Tout le monde est prêt ?
        </button>
      )}
    </>
  );
}
