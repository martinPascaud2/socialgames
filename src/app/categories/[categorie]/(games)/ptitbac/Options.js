"use client";

import { useEffect, useState } from "react";

export default function PtitbacOptions({ setOptions }) {
  const [countDownTime, setCountDownTime] = useState(4);

  useEffect(() => {
    if (countDownTime < 2) setCountDownTime(2);
    if (countDownTime > 7) setCountDownTime(7);
    setOptions((options) => ({
      ...options,
      countDownTime: countDownTime * 60 * 1000,
    }));
  }, [countDownTime]);

  return (
    <div className="m-4 flex flex-col items-center">
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
