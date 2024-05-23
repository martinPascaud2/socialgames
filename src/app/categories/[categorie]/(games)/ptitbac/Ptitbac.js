"use client";

import { useEffect, useState, useCallback } from "react";

import {
  startCountdown,
  sendResponses,
  goValidation,
  // vote,
  validate,
  manageEmptyTheme,
} from "./gameActions";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import CountDown from "@/components/CountDown";

export default function Ptitbac({
  roomId,
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const isAdmin = gameData.admin === user.name;
  const isReferee = isAdmin; //check
  const { phase, letter, themes, finishCountdownDate, counts, winners } =
    gameData;

  const [responses, setResponses] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const [valTheme, setValTheme] = useState("");
  const [themesResponses, setThemesResponses] = useState({});

  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  const handleChange = (e, i) => {
    if (e.target.value.length === 0 || hasValidated) return;
    const newResponses = [...responses];
    newResponses[i] = e.target.value;
    setResponses(newResponses);
    setIsCompleted(newResponses.every((res) => res.length >= 3));
  };

  useEffect(() => {
    if (hasValidated && phase === "searching") {
      console.log("passé par là");
      const send = async () => {
        await sendResponses({
          responses,
          userId: user.id,
          roomId,
          roomToken,
          gameData,
        });
      };
      send();
    }
  }, [hasValidated, phase]);

  useEffect(() => {
    setResponses(Array.from({ length: 6 }, () => `${letter}`));

    const send = async () => {
      if (phase === "sending") {
        setResponses(Array.from({ length: 6 }, () => ""));
        setIsCompleted(false);
        isAdmin &&
          setTimeout(async () => {
            await goValidation({
              gamers: gameData.gamers,
              roomToken,
              gameData,
            });
          }, 500);
      }
    };
    send();

    if (phase?.startsWith("validating")) {
      setValTheme(themes[phase.split("-")[1]]);
      setHasValidated(false);
    }
  }, [phase]);

  console.log("gameData", gameData);
  console.log("phase", phase);
  console.log("themesResponses", themesResponses);
  console.log("valTheme", valTheme);
  console.log("hasValidated", hasValidated);

  useEffect(() => {
    setThemesResponses(gameData.themesResponses);
  }, [gameData.themesResponses]);
  const validationList = useCallback(() => {
    if (
      !valTheme ||
      !themesResponses[valTheme] ||
      !phase.startsWith("validating")
    ) {
      return null;
    }
    const invResponses = {};
    const pendsAndVals = {};
    Object.entries({ ...themesResponses[valTheme] })
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach((res) => {
        if (res[1].validated === false) invResponses[res[0]] = res[1];
        else pendsAndVals[res[0]] = res[1];
      });

    return (
      <div>
        {Object.entries(pendsAndVals).map((res, i) => (
          <div key={i} className="flex justify-center gap-4">
            <div>{res[0]}</div>
            <div>{res[1].word}</div>
            <div>
              {res[1].validated ? (
                <CheckIcon className="block h-6 w-6 " />
              ) : isReferee ? (
                <div className="flex">
                  <button
                    onClick={() => {
                      validate({
                        gamerName: res[0],
                        validation: true,
                        roomToken,
                        gameData,
                      });
                    }}
                    className="border border-blue-300 bg-blue-100 mx-4"
                  >
                    Validax
                  </button>
                  <button
                    onClick={() => {
                      validate({
                        gamerName: res[0],
                        validation: false,
                        roomToken,
                        gameData,
                      });
                    }}
                    className="border border-blue-300 bg-blue-100 mx-4"
                  >
                    Nope
                  </button>
                </div>
              ) : (
                "..."
              )}
            </div>
          </div>
        ))}
        {Object.entries(invResponses).map((res, i) => (
          <div key={i} className="flex justify-center gap-4">
            <div>{res[0]}</div>
            <div>{res[1].word}</div>
            <div>
              <XMarkIcon className="block h-6 w-6 " />
            </div>
          </div>
        ))}
      </div>
    );
  }, [gameData, isReferee, roomToken, themesResponses, valTheme]);

  const handleTimeUp = () => {
    setTimeout(() => {
      setHasValidated(true);
    }, [1000]);
  };

  useEffect(() => {
    const manEmpty = async () => {
      if (
        phase.startsWith("validating") &&
        Object.values(themesResponses[valTheme]).every(
          (res) => res.validated === false
        )
      ) {
        await manageEmptyTheme({ roomToken, gameData });
      }
    };
    manEmpty();
  }, [themesResponses, valTheme]);

  return (
    <>
      <div className="flex flex-col items-center">
        <div>Pièces d&apos;or (objectif 5 !)</div>
        {counts
          ?.sort((a, b) => a.name.localeCompare(b.name))
          .map((gamerCount) => (
            <div key={gamerCount.name}>
              {gamerCount.name} : {gamerCount.gold} pièce
              {gamerCount.gold > 1 ? "s" : ""} d&apos;or
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

              {!hasValidated && isCompleted && (
                <button
                  onClick={() => setHasValidated(true)}
                  className="border border-blue-300 bg-blue-100"
                >
                  J&apos;ai fini !
                </button>
              )}

              <CountDown
                finishCountdownDate={finishCountdownDate}
                onTimeUp={handleTimeUp}
              />
            </div>
          )}

          {phase?.startsWith("validating") &&
            themesResponses &&
            Object.keys(themesResponses).length && (
              <>
                <div>Validation pour le thème : {valTheme}</div>
                <div>{validationList()}</div>
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
          <ChooseOneMoreGame
            gameData={gameData}
            roomToken={roomToken}
            storedLocation={storedLocation}
          />
        )
      ) : null}
    </>
  );
}
