"use client";

import { useEffect, useState } from "react";

// export default function CountDown({ finishCountdownDate, setHasValidated }) {
export default function CountDown({ finishCountdownDate, onCountdownFinish }) {
  const [leftSeconds, setLeftSeconds] = useState(1);
  const [leftMinutes, setLeftMinutes] = useState(1);

  useEffect(() => {
    let interval = setInterval(() => {
      const currentTime = Date.now();
      const leftMilliseconds = finishCountdownDate - currentTime;
      setLeftSeconds(Math.floor((leftMilliseconds / 1000) % 60));
      setLeftMinutes(Math.floor(leftMilliseconds / 1000 / 60));
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (leftMinutes <= 0 && leftSeconds <= 0) {
    // setHasValidated(true);
    // onCountdownFinish();
    // setHasValidated(true);
    // return;
  }

  return (
    <div>
      Il vous reste <span className="font-bold">{leftMinutes}</span> minutes et{" "}
      <span className="font-bold">{leftSeconds}</span> secondes !
    </div>
  );
}
