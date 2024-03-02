"use client";

import { useEffect, useState } from "react";

import {
  startCountdown,
  sendResponses,
  goValidation,
  vote,
} from "./gameActions";

import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import CountDown from "@/components/CountDown";

export default function Ptitbac({ roomId, roomToken, user, gameData }) {
  const isAdmin = gameData.admin === user.name;
  const { phase, letter, themes, finishCountdownDate, counts, winners } =
    gameData;

  const [onValidationGamerIndex, setOnValidationGamerIndex] = useState(0);
  const [onValidationResponseIndex, setOnValidationResponseIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [hasValidated, setHasValidated] = useState(false);
  const [everyoneResponses, setEveryoneResponses] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  const handleChange = (e, i) => {
    if (e.target.value.length === 0 || hasValidated) return;
    const newResponses = [...responses];
    newResponses[i] = e.target.value;
    setResponses(newResponses);
  };

  useEffect(() => {
    if (hasValidated) {
      const send = async () => {
        await sendResponses({
          responses,
          userId: user.id,
          roomToken,
          gameData,
        });
      };
      send();
    }
  }, [hasValidated]);

  useEffect(() => {
    setResponses(Array.from({ length: 6 }, () => `${letter}`));
    setHasVoted(false);

    const send = async () => {
      if (phase === "sending") {
        setResponses(Array.from({ length: 6 }, () => ""));
        setHasValidated(false);
        isAdmin &&
          setTimeout(() => {
            goValidation({ gamers: gameData.gamers, roomToken, gameData });
          }, 500);
      }
    };
    send();

    if (phase?.startsWith("validating")) {
      setOnValidationGamerIndex(phase.split("-")[1]);
      setOnValidationResponseIndex(phase.split("-")[2]);
      setEveryoneResponses(gameData.everyoneResponses);
    }
  }, [phase]);

  return (
    <>
      <div className="flex flex-col items-center">
        <div>Pièces d'or (objectif 5 !)</div>
        {counts?.map((gamerCount) => (
          <div key={gamerCount.name}>
            {gamerCount.name} : {gamerCount.gold} pièce
            {gamerCount.gold > 1 ? "s" : ""} d'or
          </div>
        ))}
      </div>

      <hr />

      {!isEnded && (
        <>
          {phase === "waiting" && isAdmin && (
            <button
              onClick={() =>
                startCountdown({
                  time: gameData.options.countDownTime, //remove
                  roomToken,
                  gameData,
                })
              }
              className="border border-blue-300 bg-blue-100"
            >
              Lancer le tour
            </button>
          )}

          {phase === "searching" && (
            <div className="flex flex-col items-center">
              <div>
                Cherchez des mots commençants par la lettre{" "}
                <span className="font-bold">{letter}</span>
              </div>
              <div className="flex flex-wrap">
                {themes.map((theme, i) => (
                  <div
                    key={theme}
                    className="w-1/3 flex flex-col items-center my-2"
                  >
                    <div>{theme}</div>
                    <input
                      type="text"
                      value={responses[i]}
                      onChange={(e) => handleChange(e, i)}
                      onKeyDown={(e) => {
                        if (e.key === "/") {
                          e.preventDefault();
                        }
                      }}
                      className="w-4/5 border focus:outline-none focus:border"
                    />
                  </div>
                ))}
              </div>

              {!hasValidated && (
                <button
                  onClick={() => setHasValidated(true)}
                  className="border border-blue-300 bg-blue-100"
                >
                  J&apos;ai fini !
                </button>
              )}

              <CountDown
                finishCountdownDate={finishCountdownDate}
                setHasValidated={setHasValidated}
              />
            </div>
          )}

          {phase?.startsWith("validating") &&
            everyoneResponses.length &&
            everyoneResponses[onValidationGamerIndex].gamer !== user.name && (
              <>
                <div className="flex flex-col items-center">
                  <div>Mots validés pour ce tour</div>
                  {counts.map((gamerCount) => (
                    <div key={gamerCount.name}>
                      {gamerCount.name} : {gamerCount.points} mot
                      {gamerCount.points > 1 ? "s" : ""}
                    </div>
                  ))}
                </div>

                <hr />

                <div className="flex flex-col items-center">
                  <div>
                    {everyoneResponses[onValidationGamerIndex].gamer} pour le
                    thème {themes[onValidationResponseIndex]} :{" "}
                    {
                      everyoneResponses[onValidationGamerIndex].responses[
                        onValidationResponseIndex
                      ]
                    }
                  </div>
                  {!hasVoted && (
                    <div className="flex">
                      <button
                        onClick={() => {
                          setHasVoted(true);
                          vote({ vote: true, roomToken, gameData });
                        }}
                        className="border border-blue-300 bg-blue-100 mx-4"
                      >
                        Validax
                      </button>
                      <button
                        onClick={() => {
                          setHasVoted(true);
                          vote({ vote: false, roomToken, gameData });
                        }}
                        className="border border-blue-300 bg-blue-100 mx-4"
                      >
                        Nope
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
        </>
      )}

      {phase === "ended" && (
        <div className="flex justify-center">
          {winners.map((winner, i) => (
            <span key={i}>
              {i > 0 ? (i === winners.length - 1 ? "et " : ", ") : ""}
              {winner}
              &nbsp;
            </span>
          ))}
          {winners.length === 1 ? "a" : "ont"} gagné la partie !
        </div>
      )}

      {isEnded && (
        <div className="flex flex-col">
          <EndGame gameData={gameData} user={user} />
        </div>
      )}
      {isAdmin ? (
        !isEnded ? (
          <FinishGame gameData={gameData} roomToken={roomToken} />
        ) : (
          <ChooseOneMoreGame gameData={gameData} roomToken={roomToken} />
        )
      ) : null}
    </>
  );
}
