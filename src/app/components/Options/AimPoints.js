"use client";

import { useEffect, useState } from "react";

export default function AimPoints({ setOptions, min, max, defaultValue }) {
  const [aimPoints, setAimPoints] = useState(
    defaultValue ? defaultValue : Math.floor((min + max) / 2)
  );

  useEffect(() => {
    if (aimPoints < min) setAimPoints(min);
    if (aimPoints > max) setAimPoints(max);
    setOptions((options) => ({
      ...options,
      aimPoints,
    }));
  }, [aimPoints]);

  return (
    <div className="m-4 flex flex-col items-center">
      <div>Objectif</div>
      <div className="border w-[60%] flex">
        <button
          onClick={() => setAimPoints((points) => points - 1)}
          className="mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
        >
          -
        </button>
        <div className="flex items-center">{aimPoints} points</div>
        <button
          onClick={() => setAimPoints((points) => points + 1)}
          className="ml-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}
