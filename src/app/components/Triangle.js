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
  w = "20",
  h = "20",
  direction = "top",
  color = "#00000",
  // childrenPosition,
  // children,
}) {
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();
  const [points, setPoints] = useState();

  useEffect(() => {
    if (!w || !h) return;

    const viewportHeight = window.innerHeight;
    const vh = Math.round(viewportHeight / 100);

    const width = parseInt(w) * parseInt(vh);
    const height = parseInt(h) * parseInt(vh);
    setWidth(width);
    setHeight(height);

    const points = {
      top: [`${width / 2},0`, `0,${height}`, `${width},${height}`],
      right: [`0,0`, `0,${height}`, `${width},${height / 2}`],
      bottom: [`0,0`, `${width},0`, `${width / 2},${height}`],
      left: [`${width},0`, `${width},${height}`, `0,${height / 2}`],
    };
    setPoints(points);
  }, [w, h]);

  if (!width || !height || !points) return null;

  return (
    <div className="relative w-full h-full">
      <svg width={width} height={height}>
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
