"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";

import {
  startDrawing,
  sendImage,
  getPng,
  goSearch,
  guessWord,
} from "./gameActions";

import NextStep from "@/components/NextStep";
import Draw from "./Draw";
import CountDown from "@/components/CountDown";

const initialState = {
  message: null,
  status: 100,
};

export default function TeamDrawing({ roomId, roomToken, user, gameData }) {
  const [userTeam, setUserTeam] = useState();
  const [timeoutId, setTimeoutId] = useState();
  const [imgData, setImgData] = useState();
  const [receivedImage, setReceivedImage] = useState();
  const [hasValidated, setHasValidated] = useState(false);
  const guessWordWithData = guessWord.bind(null, userTeam, gameData, roomToken);
  const [state, formAction] = useFormState(guessWordWithData, initialState);
  const [hasProposed, setHasProposed] = useState(false);

  const {
    teams,
    counts,
    activePlayers,
    phase,
    lastWord,
    word,
    finishCountdownDate,
    winners,
  } = gameData;
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

  useEffect(() => {
    const send = async () => {
      isActive &&
        imgData &&
        hasValidated &&
        (await sendImage({ imgData, roomToken, gameData, user }));
    };
    send();
  }, [imgData, hasValidated]);

  useEffect(() => {
    if (phase === "waiting") {
      setImgData();
      setReceivedImage();
      setHasValidated(false);
      setHasProposed(false);
    }

    const get = async () => {
      if (phase === "drawing") {
        setTimeoutId(
          setTimeout(async () => {
            const png = await getPng({ activePlayers, userTeam });
            setReceivedImage(png);
            setHasValidated(true);
            isAdmin && (await goSearch({ roomToken, gameData }));
          }, finishCountdownDate - Date.now() + 1000)
        );
      }
      if (phase === "sending") {
        clearTimeout(timeoutId);
        const png = await getPng({ activePlayers, userTeam });
        setReceivedImage(png);
        setHasValidated(true);
        isAdmin && (await goSearch({ roomToken, gameData }));
      }
      return () => {
        clearTimeout(timeoutId);
      };
    };
    get();
  }, [phase]);

  return (
    <>
      {phase === "waiting" && !gameData.ended && isAdmin && (
        <div className="fixed bottom-0 z-10 left-1/2 translate-x-[-50%] translate-y-[-25%]">
          <NextStep
            onClick={() => startDrawing({ roomId, roomToken, gameData })}
          >
            Lancer
          </NextStep>
        </div>
      )}

      <div className="overflow-y-auto">
        {!gameData.ended && (
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

            {phase === "waiting" && lastWord && (
              <div className="flex justify-center">
                Le mot était :{" "}
                <span className="font-semibold">&nbsp;{lastWord}</span>
              </div>
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
                        //   setSvg={setSvg}
                        //   setPath={setPath}
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
                        {i > 0
                          ? i === activePlayers.length - 1
                            ? "et "
                            : ", "
                          : ""}
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
      </div>
    </>
  );
}
