"use client";

import { useEffect, useState } from "react";

export default function Triangle({
  w = "20",
  h = "20",
  direction = "top",
  color = "#00000",
}) {
  const points = {
    top: [`${w / 2},0`, `0,${h}`, `${w},${h}`],
    right: [`0,0`, `0,${h}`, `${w},${h / 2}`],
    bottom: [`0,0`, `${w},0`, `${w / 2},${h}`],
    left: [`${w},0`, `${w},${h}`, `0,${h / 2}`],
  };

  return (
    <svg width={w} height={h}>
      <polygon points={points[direction].join(" ")} fill={color} />
    </svg>
  );
}

export function CornerTriangle({
  size = "60",
  direction,
  color = "#00000",
  // childrenPosition,
  // children,
}) {
  // const [dimension, setDimension] = useState();
  // const [points, setPoints] = useState();
  // const [borderInset, setBorderInset] = useState();

  // useEffect(() => {
  //   if (!size) return;

  //   const viewportHeight = window.innerHeight;
  //   const vh = Math.round(viewportHeight / 100);

  //   const dimension = parseInt(size) * parseInt(vh);
  //   setDimension(dimension);

  //   const points = {
  //     top: [
  //       `${dimension / 2},${dimension / 2}`,
  //       `0,${dimension}`,
  //       `${dimension},${dimension}`,
  //     ],
  //     // right: [`0,0`, `0,${dimension}`, `${dimension},${dimension / 2}`],
  //     bottom: [`0,0`, `${dimension},0`, `${dimension / 2},${dimension / 2}`],
  //     // left: [`${dimension},0`, `${dimension},${dimension}`, `0,${dimension / 2}`],
  //   };
  //   setPoints(points);

  //   if (direction.y === "bottom" && direction.x === "left") {
  //     setBorderInset("inset 9px 0px 5px -6px #581c87");
  //   } else if (direction.y === "bottom" && direction.x === "right") {
  //     setBorderInset("inset 0px 9px 5px -6px #581c87");
  //   } else if (direction.y === "top" && direction.x === "left") {
  //     setBorderInset("inset 0px -9px 5px -6px #581c87");
  //   } else if (direction.y === "top" && direction.x === "right") {
  //     setBorderInset("inset -9px 0px 5px -6px #581c87");
  //   }
  // }, [size, direction]);

  // if (!dimension || !points || !borderInset) return null;

  // const viewportHeight =
  //   typeof window !== "undefined" ? window.innerHeight : 800;
  // const vh = Math.round(viewportHeight / 100);
  // const dimension = parseInt(size) * vh;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 800;
  const vw = Math.round(viewportWidth / 100);
  // const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const dimension = parseInt(size) * vw;

  const points = {
    top: [
      `${dimension / 2},${dimension / 2}`,
      `0,${dimension}`,
      `${dimension},${dimension}`,
    ],
    bottom: [`0,0`, `${dimension},0`, `${dimension / 2},${dimension / 2}`],
  };

  const borderInset =
    direction.y === "bottom" && direction.x === "left"
      ? "inset 9px 0px 5px -6px #581c87"
      : direction.y === "bottom" && direction.x === "right"
      ? "inset 0px 9px 5px -6px #581c87"
      : direction.y === "top" && direction.x === "left"
      ? "inset 0px -9px 5px -6px #581c87"
      : "inset -9px 0px 5px -6px #581c87";

  return (
    <div className="relative w-full h-full">
      <svg width={dimension} height={dimension}>
        <polygon points={points[direction.y].join(" ")} fill={color} />
      </svg>

      {/* {childrenPosition && children && (
        <div
          className="absolute"
          style={{
            [childrenPosition.x]: "23%",
            [childrenPosition.y]: "20%",
          }}
        >
          {children}
        </div>
      )} */}
      <div
        className={`absolute bg-transparent rotate-45`}
        style={{
          width: dimension,
          height: dimension,
          top: direction.y === "bottom" ? `${dimension / 5}px` : "",
          bottom: direction.y === "top" ? `${dimension / 5}px` : "",
          left: direction.x === "left" ? `${dimension / 2}px` : "",
          right: direction.x === "right" ? `${dimension / 2}px` : "",
          boxShadow: borderInset,
        }}
      ></div>
    </div>
  );
}
