"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";
import Draw from "./Draw";
import CountDown from "@/components/CountDown";

import {
  startDrawing,
  sendImage,
  getPng,
  goSearch,
  guessWord,
} from "./gameActions";

const initialState = {
  message: null,
  status: 100,
};

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

  const guessWordWithData = guessWord.bind(null, userTeam, gameData, roomToken);
  const [state, formAction] = useFormState(guessWordWithData, initialState);

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
    const send = async () => {
      isActive &&
        imgData &&
        hasValidated &&
        (await sendImage({ imgData, roomId, roomToken, gameData, user }));
    };
    send();
  }, [imgData, hasValidated]);

  useEffect(() => {
    // if (!isAdmin) return;
    const get = async () => {
      let timeout;
      if (phase === "drawing") {
        timeout = setTimeout(async () => {
          const png = await getPng({ activePlayers, userTeam });
          // goSearch({ roomToken, gameData });
          setReceivedImage(png);
          setHasValidated(true);
          isAdmin && (await goSearch({ roomToken, gameData }));
        }, finishCountdownDate - Date.now() + 1000);
      }
      if (phase === "sending") {
        clearTimeout(timeout);
        // goSearch({ roomToken, gameData });
        const png = await getPng({ activePlayers, userTeam });
        setReceivedImage(png);
        setHasValidated(true);
        isAdmin && (await goSearch({ roomToken, gameData }));
      }
      return () => {
        clearTimeout(timeout);
      };
      // if (phase === "searching") {
      //   const png = await getPng({ activePlayers, userTeam });
      //   setReceivedImage(png);
      // }
    };
    get();
  }, [phase]);

  console.log("phase", phase);
  console.log("hasValidated", hasValidated);
  console.log("imgData", imgData);

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
              <div className="flex justify-center">
                Mot à dessiner :
                <span className="font-semibold">&nbsp;{word}</span>
              </div>
              {!hasValidated ? (
                <Draw
                  setImgData={setImgData}
                  setSvg={setSvg}
                  setPath={setPath}
                  setHasValidated={setHasValidated}
                  finishCountdownDate={finishCountdownDate}
                />
              ) : (
                <div>Hop ! C&apos;est envoyé ! On attend les autres...</div>
              )}
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
          <CountDown finishCountdownDate={finishCountdownDate} />
        </>
      )}

      {/* <div>Image envoyé de {newImageFrom}</div> */}

      {phase === "searching" && receivedImage && (
        <>
          <div
            style={{
              position: "relative",
              width: "auto",
              height: "50vh",
              // left: "5vw",
            }}
          >
            <Image
              src={receivedImage}
              alt="drawing-png"
              // sizes="500px"
              fill
              style={{
                objectFit: "contain",
              }}
            />
          </div>
          <div className="flex justify-center">
            {isActive ? (
              <form
                action={formAction}
                className="flex flex-col justify-center items-center"
              >
                <label htmlFor="guess">Propose un mot</label>
                <input
                  type="text"
                  name="guess"
                  id="guess"
                  className="border focus:outline-none focus:border-2"
                />

                <button
                  type="submit"
                  className="border border-blue-300 bg-blue-100"
                >
                  Envoi
                </button>
              </form>
            ) : (
              <div>Ton équipe cherche le mot</div>
            )}
          </div>
        </>
      )}
    </>
  );
}
