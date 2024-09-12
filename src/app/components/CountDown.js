"use client";

import { useEffect, useState } from "react";

export default function CountDown({
  finishCountdownDate,
  setHasValidated,
  onTimeUp,
  label,
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
    return;
  }

  return (
    <div className="flex justify-center">
      {(leftMinutes || leftSeconds > 0) && (
        <>
          {label ? <span>{label}</span> : <span>Il vous reste</span>}
          &nbsp;
          {leftMinutes > 0 && (
            <span>
              <span className="font-bold">{leftMinutes}</span>
              &nbsp;minute{leftMinutes >= 2 ? "s" : ""}&nbsp;et&nbsp;
            </span>
          )}
          <span className="font-bold">{leftSeconds}</span>&nbsp;seconde
          {leftSeconds >= 2 ? "s" : ""}.
        </>
      )}
    </div>
  );
}
