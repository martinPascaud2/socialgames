"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";
import Draw from "./Draw";
import CountDown from "@/components/CountDown";
import FinishGame from "@/components/FinishGame";
import EndGame from "@/components/EndGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";

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
  const [hasProposed, setHasProposed] = useState(false);
  const [imgData, setImgData] = useState();
  const [svg, setSvg] = useState();
  const [path, setPath] = useState();
  const [userTeam, setUserTeam] = useState();
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  //setteams
  console.log("gameData", gameData);
  const {
    teams,
    counts,
    activePlayers,
    phase,
    lastWord,
    word,
    finishCountdownDate,
    ended,
    winners,
  } = gameData;
  const [receivedImage, setReceivedImage] = useState();
  const isAdmin = gameData.admin === user.name;
  const isActive = activePlayers?.some((active) => active.name === user.name);

  const guessWordWithData = guessWord.bind(null, userTeam, gameData, roomToken);
  const [state, formAction] = useFormState(guessWordWithData, initialState);
  const [timeoutId, setTimeoutId] = useState();

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
    if (phase === "waiting") {
      setImgData();
      setReceivedImage();
      setHasValidated(false);
      setHasProposed(false);
      // setTimeoutId() ??
    }
    // if (!isAdmin) return;
    const get = async () => {
      let timeout;
      if (phase === "drawing") {
        // timeout = setTimeout(async () => {
        setTimeoutId(
          setTimeout(async () => {
            const png = await getPng({ activePlayers, userTeam });
            // goSearch({ roomToken, gameData });
            setReceivedImage(png);
            setHasValidated(true);
            isAdmin && (await goSearch({ roomToken, gameData }));
          }, finishCountdownDate - Date.now() + 1000)
        );
      }
      if (phase === "sending") {
        // clearTimeout(timeout);
        clearTimeout(timeoutId);
        // goSearch({ roomToken, gameData });
        const png = await getPng({ activePlayers, userTeam });
        setReceivedImage(png);
        setHasValidated(true);
        isAdmin && (await goSearch({ roomToken, gameData }));
      }
      return () => {
        // clearTimeout(timeout);
        clearTimeout(timeoutId);
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
                <div className="border-2 border-red-300">
                  {counts[team[0]].points} point
                  <span>{counts[team[0]].points >= 2 ? "s" : ""}</span>
                </div>
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

      {phase === "waiting" && (
        <>
          {lastWord && (
            <div className="flex justify-center">
              Le mot était :{" "}
              <span className="font-semibold">&nbsp;{lastWord}</span>
            </div>
          )}
          {isAdmin && (
            <button
              onClick={() => startDrawing({ roomId, roomToken, gameData })}
              className="w-full border border-blue-300 bg-blue-100"
            >
              Tout le monde est prêt ?
            </button>
          )}
        </>
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
                <div className="flex justify-center">
                  Hop ! C&apos;est envoyé ! On attend les autres...
                </div>
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
          <div className="flex justify-center">
            <CountDown finishCountdownDate={finishCountdownDate} />
          </div>
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
              !hasProposed ? (
                <form
                  action={(FormData) => {
                    formAction(FormData);
                    setHasProposed(true);
                  }}
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
                <div>Proposition envoyée, on attend les autres...</div>
              )
            ) : (
              <div>Ton équipe cherche le mot</div>
            )}
          </div>
        </>
      )}

      {phase === "ended" && (
        <div className="flex flex-col items-center">
          <div>Fin du jeu !</div>
          <div>Les vainqueurs sont :</div>
          <div>
            {winners.map((winner, i) => (
              <span key={i}>
                {i > 0 ? (i === winners.length - 1 ? " et " : ", ") : ""}
                {winner.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {isAdmin ? (
        !isEnded ? (
          <FinishGame gameData={gameData} roomToken={roomToken} />
        ) : (
          <ChooseOneMoreGame gameData={gameData} roomToken={roomToken} />
        )
      ) : isEnded ? (
        <EndGame gameData={gameData} user={user} />
      ) : null}
    </>
  );
}
