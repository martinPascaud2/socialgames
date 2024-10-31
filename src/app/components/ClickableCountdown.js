"use client";

import { useEffect, useState } from "react";

export default function ClickableCountDown({
  finishCountdownDate,
  onTimeUp,
  onClick,
  isValidationSaved,
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

  useEffect(() => {
    if (
      leftMinutes &&
      leftSeconds &&
      leftMinutes <= 0 &&
      leftSeconds <= 0 &&
      !isValidationSaved
    ) {
      onTimeUp && onTimeUp();
    }
  }, [leftMinutes, leftSeconds, onTimeUp, isValidationSaved]);

  return (
    <div
      onClick={onClick}
      className={`flex justify-center items-center border rounded-full aspect-square w-16 h-16 ${
        !isValidationSaved
          ? "border-blue-400 bg-blue-100"
          : "border-green-400 bg-green-100"
      }`}
    >
      {(leftMinutes || leftSeconds > 0) && (
        <div
          className={`flex ${
            !isValidationSaved ? "text-blue-400" : "text-green-400"
          }`}
        >
          {leftMinutes > 0 && (
            <span className="text-center">
              {leftMinutes < 10 ? "0" : ""}
              {leftMinutes}
            </span>
          )}
          <span>{" : "}</span>
          <span className="text-center">
            {leftSeconds < 10 ? "0" : ""}
            {leftSeconds}
          </span>
        </div>
      )}
    </div>
  );
}
