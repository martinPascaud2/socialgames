"use client";

import Image from "next/image";

import classNames from "classnames";

export default function Card({
  index,
  iconKey,
  src,
  triggered,
  discovered,
  reveal,
}) {
  return (
    <div className="bg-transparent w-[24%] aspect-square inline-block m-[0.5%] perspective-10">
      <div
        onClick={() => {
          if (triggered || discovered) return;
          reveal({ index, iconKey });
        }}
        className={classNames(
          "flip-card relative w-full h-full rounded-2xl	border-2",
          `transition-transform duration-500 transform-style-3d ${
            triggered || discovered ? "rotate-y-[-180deg]" : ""
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
