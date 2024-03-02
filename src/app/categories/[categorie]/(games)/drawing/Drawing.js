"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import Draw from "./Draw";
import CountDown from "@/components/CountDown";

import { startDrawing, sendImage, getPng } from "./gameActions";

export default function Drawing({ roomId, roomToken, user, gameData }) {
  const [hasValidated, setHasValidated] = useState(false);
  const [imgData, setImgData] = useState("");
  const [svg, setSvg] = useState();
  const [path, setPath] = useState();
  console.log("gameData", gameData);
  const { teams, activePlayers, phase, finishCountdownDate, newImageFrom } =
    gameData;
  const [receivedImage, setReceivedImage] = useState();
  const isAdmin = gameData.admin === user.name;
  const isActive = activePlayers.some((active) => active.name === user.name);

  useEffect(() => {
    console.log("newImageFrom", newImageFrom);
    const get = async () => {
      const newReceivedImage = await getPng({ userName: newImageFrom, roomId });
      setReceivedImage(newReceivedImage);
    };
    newImageFrom && get();
  }, [gameData, newImageFrom, roomId]);

  console.log("path", path);
  console.log("svg", svg);

  useEffect(() => {
    sendImage({ imgData, roomId, roomToken, gameData, userName: user.name });
  }, [imgData]);

  return (
    <>
      <div className="flex flex-col items-between">
        <div className="self-center">Equipes</div>
        <div className="flex justify-around">
          {Object.entries(gameData.teams).map((team) => (
            <div key={team[0]} className="flex flex-col">
              {team[1].map((gamer) => (
                <div
                  key={gamer.name}
                  className={`${
                    activePlayers?.some((player) => player.name === gamer.name)
                      ? "font-bold"
                      : ""
                  }`}
                >
                  {gamer.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <hr />

      {phase === "waiting" && isAdmin && (
        <button
          onClick={() => startDrawing({ roomToken, gameData })}
          className="w-full border border-blue-300 bg-blue-100"
        >
          Tout le monde est prêt ?
        </button>
      )}

      {phase === "drawing" && (
        <>
          {isActive ? (
            <Draw setImgData={setImgData} setSvg={setSvg} setPath={setPath} />
          ) : (
            <div className="flex justify-center">
              {activePlayers.map((active, i) => (
                <span key={i}>
                  {i > 0 ? (i === activePlayers.length - 1 ? "et " : ", ") : ""}
                  {active.name}&nbsp;
                </span>
              ))}
              dessinent !
            </div>
          )}
          <CountDown
            finishCountdownDate={finishCountdownDate}
            setHasValidated={setHasValidated}
          />
        </>
      )}

      <div>Image envoyé de {newImageFrom}</div>

      {receivedImage && <img src={receivedImage} />}
    </>
  );
}
