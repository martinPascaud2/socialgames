"use client";

import { useEffect, useState } from "react";

export default function AimPoints({ setOptions, min, max, defaultValue }) {
  const [aimPoints, setAimPoints] = useState(
    defaultValue !== undefined ? defaultValue : Math.floor((min + max) / 2)
  );

  useEffect(() => {
    setAimPoints(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (aimPoints < min) setAimPoints(min);
    if (aimPoints > max) setAimPoints(max);

    setOptions((options) => ({
      ...options,
      aimPoints,
    }));
  }, [aimPoints]);

  return (
    <div className="m-1 flex flex-col items-center justify-center">
      <div>Objectif</div>
      <div className="border w-full flex">
        <button
          onClick={() => setAimPoints((points) => points - 1)}
          className="mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
        >
          -
        </button>
        <div className="flex items-center">
          {aimPoints === 0
            ? "Illimité"
            : `${aimPoints} point${aimPoints >= 2 ? "s" : ""}`}
        </div>
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
