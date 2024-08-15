"use client";

import { useEffect, useState } from "react";

export default function CountDown({
  finishCountdownDate,
  setHasValidated,
  onTimeUp,
}) {
  const [leftSeconds, setLeftSeconds] = useState();
  const [leftMinutes, setLeftMinutes] = useState();

  useEffect(() => {
    if (!finishCountdownDate) return;
    let interval = setInterval(() => {
      const currentTime = Date.now();
      const leftMilliseconds = finishCountdownDate - currentTime;
      setLeftSeconds(Math.floor((leftMilliseconds / 1000) % 60));
      setLeftMinutes(Math.floor(leftMilliseconds / 1000 / 60));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [finishCountdownDate]);

  if (leftMinutes && leftSeconds && leftMinutes <= 0 && leftSeconds <= 0) {
    setHasValidated && setHasValidated(true);
    onTimeUp && onTimeUp();
  }

  return (
    <div>
      Il vous reste <span className="font-bold">{leftMinutes}</span> minutes et{" "}
      <span className="font-bold">{leftSeconds}</span> secondes !
    </div>
  );
}
