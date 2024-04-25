"use client";

import { useState, useEffect, useCallback } from "react";
import "./ripple.css";

import { useLongPress, LongPressEventType } from "use-long-press";
import { aimPlayer } from "./gameActions";

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
        !longPressed ? "bg-red-600" : "bg-green-600"
      }  text-white overflow-hidden relative cursor-pointer`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isRippling && !longPressed ? (
        <span
          // className="ripple"
          className="absolute w-5 h-5 bg-red-400 block border-0 rounded-full"
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
      <span className="content relative z-2 select-none">
        {!isValidated ? "Envoyer" : "Validé !"}
      </span>
    </button>
  );
};

export default function Triaction({ roomId, roomToken, user, gameData }) {
  console.log("gameData", gameData);
  const { phase, gamers, activePlayer } = gameData;
  const isActive = gameData.activePlayer?.id === user.id;
  const [isValidated, setIsValidated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const place = gamers.find((gamer) => gamer.name === user.name).place;

  const aim = async ({ aimerPlace, aimed }) => {
    if (aimed.place) return;
    await aimPlayer({ aimerPlace, aimed, roomToken, gameData });
  };

  const validate = () => {
    setShowConfirm(true);
  };

  const confirm = () => {};

  const cancel = () => {
    setIsValidated(false);
    setShowConfirm(false);
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 h-[80vh]">
      {phase === "peek" && (
        <>
          <div className="mx-3 text-center">
            <div>Règle peek !</div>
            <div>Les joueurs choisissent leur cible</div>
          </div>
          <div>
            {isActive ? (
              <span className="font-bold">A votre tour !</span>
            ) : (
              <div>
                Au tour de{" "}
                <span className="font-bold">{activePlayer.name}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            {gamers.map((gamer, i) => {
              return (
                <button
                  key={i}
                  onClick={() =>
                    isActive && aim({ aimerPlace: place, aimed: gamer })
                  }
                  className={`rounded-md m-2 px-4 py-2 border text-center ${
                    gamer.place
                      ? "bg-red-300 border-red-600"
                      : "bg-green-300 border-green-600"
                  }`}
                >
                  {gamer.name}
                </button>
              );
            })}
          </div>
        </>
      )}
      {phase === "write" && (
        <>
          <RipplingButton
            onLongPress={validate}
            isValidated={isValidated}
            setIsValidated={setIsValidated}
          />

          {!showConfirm ? (
            <div className="flex justify-center m-2">
              Envoyer les trois actions à X .
            </div>
          ) : (
            <div className="flex flex-col w-[90%]">
              <div className="flex justify-center text-center m-2">
                Ces trois gages ne seront plus modifiables, tu confirmes ?
              </div>
              <div className="flex justify-evenly w-full">
                <button
                  onClick={() => confirm()}
                  className="rounded-md border border-green-300 bg-green-100 px-4 py-2"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => cancel()}
                  className="rounded-md border border-red-300 bg-red-100 px-4 py-2"
                >
                  Modifier
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
