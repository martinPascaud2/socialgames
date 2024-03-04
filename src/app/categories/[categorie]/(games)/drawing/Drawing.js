"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Draw from "./Draw";
import CountDown from "@/components/CountDown";

import { startDrawing, sendImage, getPng, goSearch } from "./gameActions";

export default function Drawing({ roomId, roomToken, user, gameData }) {
  const [hasValidated, setHasValidated] = useState(false);
  const [imgData, setImgData] = useState();
  const [svg, setSvg] = useState();
  const [path, setPath] = useState();
  const [userTeam, setUserTeam] = useState();
  //setteams
  console.log("gameData", gameData);
  const { teams, activePlayers, phase, word, finishCountdownDate } = gameData;
  const [receivedImage, setReceivedImage] = useState();
  const isAdmin = gameData.admin === user.name;
  const isActive = activePlayers?.some((active) => active.name === user.name);

  useEffect(() => {
    if (!teams) return;
    Object.entries(teams).map((team) =>
      team[1].map((gamer) => {
        if (gamer.name === user.name) {
          setUserTeam(team[0]);
        }
      })
    );
  }, [teams]);

  console.log("path", path);
  console.log("svg", svg);
  console.log("userTeam", userTeam);

  useEffect(() => {
    isActive &&
      imgData &&
      !hasValidated &&
      sendImage({ imgData, roomId, roomToken, gameData, user });
  }, [imgData]);

  useEffect(() => {
    // if (!isAdmin) return;
    const get = async () => {
      let timeout;
      if (phase === "drawing") {
        timeout = setTimeout(async () => {
          const png = await getPng({ activePlayers, userTeam });
          // goSearch({ roomToken, gameData });
          setReceivedImage(png);
        }, finishCountdownDate - Date.now() + 1000);
      }
      if (phase === "sending") {
        clearTimeout(timeout);
        // goSearch({ roomToken, gameData });
        const png = await getPng({ activePlayers, userTeam });
        setReceivedImage(png);
      }
    };
    get();
  }, [phase]);

  return (
    <>
      <div className="flex flex-col items-between">
        <div className="self-center">Equipes</div>
        <div className="flex justify-around">
          {teams &&
            Object.entries(teams).map((team) => (
              <div key={team[0]} className="flex flex-col">
                {team[1].map((gamer) => (
                  <div
                    key={gamer.name}
                    className={`${
                      activePlayers?.some(
                        (player) => player.name === gamer.name
                      )
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
          onClick={() => startDrawing({ roomId, roomToken, gameData })}
          className="w-full border border-blue-300 bg-blue-100"
        >
          Tout le monde est prêt ?
        </button>
      )}

      {phase === "drawing" && (
        <>
          {isActive ? (
            <>
              <div>Mot à dessiner : {word}</div>
              <Draw
                setImgData={setImgData}
                setSvg={setSvg}
                setPath={setPath}
                finishCountdownDate={finishCountdownDate}
              />
            </>
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

      {/* <div>Image envoyé de {newImageFrom}</div> */}

      {receivedImage && <img src={receivedImage} />}
    </>
  );
}
