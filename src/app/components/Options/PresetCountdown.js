"use client";

import { useEffect, useState } from "react";

export default function PresetCountdown({
  isAdmin,
  options,
  setOptions,
  times,
  last,
}) {
  const [countDownTime, setCountDownTime] = useState(
    typeof last === "number" ? last / 60 / 1000 : times.default
  );
  const [timeIndex, setTimeIndex] = useState(
    times.values.findIndex((value) => value === countDownTime)
  );

  useEffect(() => {
    if (!typeof last === "number" || !isAdmin) return;

    setCountDownTime(last / 60 / 1000);
  }, [last, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    if (timeIndex < 0) {
      setTimeIndex(0);
      return;
    }
    if (timeIndex >= times.values.length) {
      setTimeIndex(times.values.length - 1);
      return;
    }

    const newCountDownTime = times.values[timeIndex];
    setCountDownTime(newCountDownTime);
    setOptions((options) => ({
      ...options,
      countDownTime: newCountDownTime * 60 * 1000,
    }));
  }, [timeIndex]);

  useEffect(() => {
    if (isAdmin) return;

    setCountDownTime(options.countDownTime / 60 / 1000);
  }, [options, isAdmin]);

  return (
    <div className="m-1 flex flex-col items-center justify-center">
      <div>Temps des tours</div>
      <div className="border w-full flex">
        <button
          onClick={() => setTimeIndex((index) => index - 1)}
          className={`mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center ${
            !isAdmin ? "collapse" : ""
          }`}
        >
          -
        </button>
        <div className="flex items-center">
          {countDownTime !== 0 ? (
            <span>
              {countDownTime} minute{countDownTime >= 2 ? "s" : ""}
            </span>
          ) : (
            <span>Illimité</span>
          )}
        </div>
        <button
          onClick={() => setTimeIndex((index) => index + 1)}
          className={`ml-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center ${
            !isAdmin ? "collapse" : ""
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
}
