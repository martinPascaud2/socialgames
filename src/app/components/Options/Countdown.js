"use client";

import { useEffect, useState } from "react";

export default function Countdown({ setOptions, min, max, last }) {
  const [countDownTime, setCountDownTime] = useState(
    (last && last / 60 / 1000) || Math.floor((min + max) / 2)
  );

  useEffect(() => {
    if (countDownTime < min) setCountDownTime(min);
    if (countDownTime > max) setCountDownTime(max);
    setOptions((options) => ({
      ...options,
      countDownTime: countDownTime * 60 * 1000,
    }));
  }, [countDownTime]);

  return (
    <div className="m-1 flex flex-col items-center">
      <div>Temps des tours</div>
      <div className="border w-[60%] flex">
        <button
          onClick={() => setCountDownTime((time) => time - 1)}
          className="mr-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
        >
          -
        </button>
        <div className="flex items-center">{countDownTime} minutes</div>
        <button
          onClick={() => setCountDownTime((time) => time + 1)}
          className="ml-auto border border-blue-300 bg-blue-100 w-[20%] flex justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}
