"use client";

import { useState, useEffect, useCallback } from "react";
import "./test.css";

import { useLongPress, LongPressEventType } from "use-long-press";

const RipplingButton = ({ onLongPress, isValidated, setIsValidated }) => {
  const [longPressed, setLongPressed] = useState(false);
  const [coords, setCoords] = useState({ x: -1, y: -1 });
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    if (coords.x !== -1 && coords.y !== -1) {
      setIsRippling(true);
    } else setIsRippling(false);
  }, [coords]);

  useEffect(() => {
    if (!isRippling) setCoords({ x: -1, y: -1 });
  }, [isRippling]);

  const callback = useCallback(() => {
    if (longPressed) return;
    setLongPressed(true);
    setIsValidated(true);
    onLongPress();
  }, [longPressed]);

  const cancel = () => {
    setLongPressed(false);
  };
  useEffect(() => {
    if (!isValidated) cancel();
  }, [isValidated]);

  const bind = useLongPress(callback, {
    onStart: (e, meta) => {
      const rect = e.target.getBoundingClientRect();
      setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsRippling(true);
    },
    onFinish: (event, meta) => {
      setIsRippling(false);
    },
    onCancel: (event, meta) => {
      setIsRippling(false);
    },
    //onMove: () => console.log("Detected mouse or touch movement"),
    filterEvents: (event) => true, //check
    threshold: 2000,
    captureEvent: true,
    cancelOnMovement: false,
    cancelOutsideElement: true,
    detect: LongPressEventType.Pointer,
  });

  return (
    <button
      {...bind()}
      className={`hold-button rounded-md border-0 w-[90%] px-6 py-4 ${
        !longPressed ? "bg-blue-600" : "bg-green-600"
      }  text-white overflow-hidden relative cursor-pointer`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isRippling ? (
        <span
          // className="ripple"
          className="absolute w-5 h-5 bg-blue-400 block border-0 rounded-full"
          style={{
            animationDuration: "10s",
            animationTimingFunction: "ease",
            animationIterationCount: "1",
            animationFillMode: "forwards",
            // animationName: isRippling ? "ripple-effect" : "",
            animationName: "ripple-effect",
            left: coords.x,
            top: coords.y,
          }}
        />
      ) : (
        ""
      )}
      <span className="content relative z-2 select-none">Envoyer</span>
    </button>
  );
};

export default function Triaction({ roomId, roomToken, user, gameData }) {
  const [isValidated, setIsValidated] = useState(false);

  const validate = () => {
    console.log("olé");
  };

  const cancel = () => {
    setIsValidated(false);
  };

  return (
    <div className="flex flex-col items-center">
      <RipplingButton
        onLongPress={validate}
        isValidated={isValidated}
        setIsValidated={setIsValidated}
      />

      <button onClick={() => cancel()}>Reset</button>
    </div>
  );
}
