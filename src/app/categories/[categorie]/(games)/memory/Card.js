"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import classNames from "classnames";

export default function Card({
  iconKey,
  src,
  setTriggered,
  triggered,
  discovered,
}) {
  console.log("iconKey", iconKey);
  console.log("discovered", discovered);
  //   const [triggerReveal, setTriggerReveal] = useState(false);
  const [triggerReveal, setTriggerReveal] = useState(discovered);

  const triggeredNumber = Object.values(triggered).reduce(
    (acc, trig) => acc + trig,
    0
  );
  useEffect(() => {
    // Object.values(triggered).reduce((acc, trig) => acc + trig, 0) === 2 &&
    (triggeredNumber === 0 || triggeredNumber === 2) &&
      setTimeout(() => {
        console.log("this is the second message");
        setTriggerReveal(discovered);
      }, 2000);
  }, [triggered, discovered]);

  return (
    <div className="bg-transparent w-[24%] aspect-square inline-block m-[0.5%] perspective-10">
      <div
        onClick={() => {
          //   !triggerReveal && setTrigNum((prev) => (prev === 0 ? 1 : 0));
          triggeredNumber < 2 &&
            !triggerReveal &&
            setTriggered((trigs) => ({
              ...trigs,
              [iconKey]: (trigs[iconKey] || 0) + 1,
            }));
          setTriggerReveal(true);
        }}
        className={classNames(
          "flip-card relative w-full h-full rounded-2xl	border-2",
          `transition-transform duration-1000 transform-style-3d ${
            triggerReveal ? "rotate-y-[-180deg]" : ""
          }`
        )}
      >
        <div
          className={`card-front absolute w-full h-full rounded-2xl backface-hidden rotate-y-[180deg]`}
        >
          <Image src={src} alt="Memory icon" />
        </div>
        <div className="card-back absolute w-full h-full rounded-2xl backface-hidden bg-red-500"></div>
      </div>
    </div>
  );
}
