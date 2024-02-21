"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { getIcons } from "./gameActions";
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

console.log("images", images);
console.log("imagesNames", imagesNames);

export default function Memory({ roomId, roomToken, user, gameData }) {
  console.log("gameData", gameData);
  const [icons, setIcons] = useState([]);
  const [triggered, setTriggered] = useState({});
  const [discovered, setDiscovered] = useState([]);
  useEffect(() => {
    async function initialize() {
      const icons = await getIcons({
        imageLength,
        pairsNumber: 10,
        roomToken,
        gameData,
      });
      console.log("icons", icons);
    }
    initialize();
  }, []);

  useEffect(() => {
    gameData.icons && setIcons(gameData.icons);
  }, [gameData.icons]);
  console.log("icons", icons);
  console.log("triggered", triggered);

  useEffect(() => {
    console.log("Object.keys(triggered).length", Object.keys(triggered).length);

    console.log(
      "Object.keys(triggered).reduce((acc, trig) => acc + trig, 0)",
      Object.keys(triggered).reduce((acc, trig) => acc + parseInt(trig), 0)
    );

    const trigerredKeys = Object.keys(triggered);
    if (
      //   Object.keys(triggered).length === 0 ||
      trigerredKeys.length === 0 ||
      //   Object.values(triggered).reduce((acc, trig) => acc + parseInt(trig), 0) <
      Object.values(triggered).reduce((acc, trig) => acc + trig, 0) < 2
    )
      return;

    if (trigerredKeys.length === 1)
      setDiscovered((prevDisco) => [...prevDisco, parseInt(trigerredKeys[0])]);
    console.log("triggered", triggered);
    setTriggered({});
  }, [triggered]);

  console.log("discovered", discovered);

  return (
    <div className="flex flex-wrap justify-center">
      {icons.map((iconKey, i) => (
        <Card
          key={i}
          iconKey={iconKey}
          src={images[imagesNames[iconKey]]}
          setTriggered={setTriggered}
          triggered={triggered}
          discovered={discovered.some(
            // (disco) => parseInt(disco) === parseInt(iconKey)
            (disco) => disco === iconKey
          )}
        />
      ))}
      {/* <Card src={images[imagesNames[3]]} setTrigNum={setTrigNum} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} />
      <Card src={images[imagesNames[0]]} /> */}
      {/* <div className="transform-style-3d rotate-y-[-180deg]">
        <div
          className={`card-front absolute w-full h-full rounded-2xl backface-hidden bg-yellow-500 rotate-y-[180deg]`}
        >
          <Image src={images[imagesNames[0]]} />
        </div>
        <div className="card-back absolute w-full h-full rounded-2xl backface-hidden bg-red-500"></div>
      </div> */}
    </div>
  );
}
