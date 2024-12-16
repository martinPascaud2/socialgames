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
  size = "30",
  direction = "top",
  color = "#00000",
  // childrenPosition,
  // children,
}) {
  const [dimension, setDimension] = useState();
  const [points, setPoints] = useState();

  useEffect(() => {
    if (!size) return;

    const viewportHeight = window.innerHeight;
    const vh = Math.round(viewportHeight / 100);

    const dimension = parseInt(size) * parseInt(vh);
    setDimension(dimension);

    const points = {
      top: [
        `${dimension / 2},${dimension / 2}`,
        `0,${dimension}`,
        `${dimension},${dimension}`,
      ],
      // right: [`0,0`, `0,${dimension}`, `${dimension},${dimension / 2}`],
      bottom: [`0,0`, `${dimension},0`, `${dimension / 2},${dimension / 2}`],
      // left: [`${dimension},0`, `${dimension},${dimension}`, `0,${dimension / 2}`],
    };
    setPoints(points);
  }, [size]);

  if (!dimension || !points) return null;

  return (
    <div className="relative w-full h-full">
      <svg width={dimension} height={dimension}>
        <polygon points={points[direction].join(" ")} fill={color} />
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
    </div>
  );
}
