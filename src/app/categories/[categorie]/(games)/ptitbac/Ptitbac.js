"use client";

import { useEffect, useState, useCallback } from "react";

import {
  startCountdown,
  sendResponses,
  goValidation,
  // vote,
  refereeTrigger,
  validate,
  manageEmptyTheme,
} from "./gameActions";

import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

import FinishGame from "@/components/FinishGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";
import EndGame from "@/components/EndGame";
import CountDown from "@/components/CountDown";
import ToggleCheckbox from "@/components/Room/ToggleCheckbox";
import NextStep from "@/components/NextStep";

function levenshtein(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function groupSimilarWords(responses, threshold = 1) {
  const groups = [];
  const visited = new Set();

  Object.entries(responses).forEach((res) => {
    // if (!visited.has(res[1].word)) {
    if (!visited.has(res[0])) {
      const group = [{ gamer: res[0], response: res[1] }];
      // visited.add(res[1].word);
      visited.add(res[0]);

      Object.entries(responses).forEach((otherRes) => {
        if (
          // !visited.has(otherRes[1].word) &&
          !visited.has(otherRes[0]) &&
          levenshtein(res[1].word, otherRes[1].word) <= threshold
        ) {
          // group.push(otherRes.word);
          group.push({ gamer: otherRes[0], response: otherRes[1] });
          // visited.add(otherRes[1].word);
          visited.add(otherRes[0]);
        }
      });

      groups.push(group);
    }
  });

  return groups;
}

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

  // const [responses, setResponses] = useState([]);
  const [responses, setResponses] = useState(
    Array.from({ length: 6 }, () => "")
  );

  const [isCompleted, setIsCompleted] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const [valTheme, setValTheme] = useState("");
  const [themesResponses, setThemesResponses] = useState({});
  const [allFalse, setAllFalse] = useState();
  const [refereeValidation, setRefereeValidation] = useState({});

  useEffect(() => {
    if (gameData.ended) setIsEnded(true);
  }, [gameData.ended]);

  const handleChange = (e, i) => {
    if (e.target.value.length === 0 || hasValidated) return;
    const newResponses = [...responses];
    newResponses[i] = e.target.value;
    setResponses(newResponses);
    setIsCompleted(newResponses.every((res) => res.length >= 2));
  };

  useEffect(() => {
    if ((hasValidated && phase === "searching") || phase === "sending") {
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

    // setRefereeValidation({});
  }, [hasValidated, phase]);

  useEffect(() => {
    phase === "searching" &&
      setResponses(Array.from({ length: 6 }, () => `${letter}`));
    // setRefereeValidation({});

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
          }, 2000);
      }
    };
    send();

    if (phase?.startsWith("validating")) {
      setValTheme(themes[phase.split("-")[1]]);
      setHasValidated(false);
      // setRefereeValidation({});
    }
  }, [phase]);

  useEffect(() => {
    if (
      Object.keys(themesResponses).length &&
      valTheme &&
      Object.values(themesResponses[valTheme]).every(
        (res) => res.validated === false
      )
    )
      setAllFalse(true);
    else setAllFalse(false);
  }, [valTheme]); // tricky : no themesResponses_dep

  console.log("gameData", gameData);
  console.log("phase", phase);
  console.log("themesResponses", themesResponses);
  console.log("valTheme", valTheme);
  console.log("hasValidated", hasValidated);
  console.log("responses", responses);
  console.log("refereeValidation", refereeValidation);

  useEffect(() => {
    console.log("gameData.themesResponses", gameData.themesResponses);
    console.log("valTheme", valTheme);
    if (
      !gameData.themesResponses ||
      !Object.values(gameData.themesResponses).length ||
      !valTheme ||
      !gameData.themesResponses[valTheme]
    )
      return;
    setThemesResponses(gameData.themesResponses);

    const groupedRes = groupSimilarWords(gameData.themesResponses[valTheme], 1);
    console.log("groupedRes", groupedRes);
    const refVal = {};
    groupedRes.forEach((group, i) => {
      console.log("group", group, "i", i);
      refVal[i] = {
        gamers: group.map((gamer) => gamer.gamer),
        word: group[0].response.word,
        validated: group[0].response.validated,
      };
    });
    setRefereeValidation(refVal);
  }, [gameData.themesResponses, valTheme, phase]);

  useEffect(() => {
    gameData.refereeValidation &&
      setRefereeValidation(gameData.refereeValidation);
  }, [gameData.refereeValidation]);

  const validationList = useCallback(() => {
    if (
      !valTheme ||
      !themesResponses ||
      !themesResponses[valTheme] ||
      !Object.keys(refereeValidation).length ||
      !phase.startsWith("validating")
    ) {
      return;
    }

    return (
      <div>
        <div className="flex justify-center border-b">
          Validation pour la catégorie :
          <span className="font-semibold">&nbsp;{valTheme}</span>
        </div>

        {/* {groupedRes.map((group, i) => { */}
        {Object.values(refereeValidation).map((group, i) => {
          console.log("group", group);

          const isInvalidated = group.validated === false;

          return (
            <div key={i} className="flex justify-between items-center border-b">
              <div className="flex flex-col my-2 items-start w-1/6">
                {group.gamers.map((gamer, j) => {
                  return (
                    <div key={j} className="flex flex-col my-1 ml-2">
                      <div className="flex gap-2">
                        <div className="font-semibold">{gamer}</div>
                        {/* <div>{gamerRes.response.word}</div> */}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col w-1/6 justify-center items-center">
                <div>{group.word}</div>
              </div>
              <div className="flex flex-col w-1/6 justify-center items-center mr-2">
                {isReferee ? (
                  <ToggleCheckbox
                    onChange={async () => {
                      const newRefereeValidation = {
                        ...refereeValidation,
                        [i]: {
                          ...refereeValidation[i],
                          validated: !refereeValidation[i].validated,
                        },
                      };
                      await refereeTrigger({
                        group,
                        newRefereeValidation,
                        validated: !refereeValidation[i].validated,
                        roomToken,
                        gameData,
                      });
                    }}
                    checked={!isInvalidated}
                    colors={{ yes: "rgb(22, 163, 74)", no: "rgb(220, 38, 38)" }}
                    size={70}
                  />
                ) : (
                  <div>
                    {!isInvalidated ? (
                      <CheckIcon className="block h-6 w-6 " />
                    ) : (
                      <XMarkIcon className="block h-6 w-6 " />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isReferee && (
          <div className="flex justify-center m-4">
            <NextStep
              onClick={async () => {
                if (allFalse) {
                  await manageEmptyTheme({ roomToken, gameData });
                } else {
                  await validate({ roomToken, gameData });
                }
              }}
            >
              Suite ={">"}
            </NextStep>
          </div>
        )}
      </div>
    );
  }, [
    gameData,
    isReferee,
    roomToken,
    themesResponses,
    valTheme,
    phase,
    allFalse,
    refereeValidation,
  ]);

  const handleTimeUp = () => {
    setTimeout(() => {
      setHasValidated(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center">
        <div className="font-semibold">Points</div>
        {counts
          ?.sort((a, b) => a.name.localeCompare(b.name))
          .map((gamerCount) => (
            <div key={gamerCount.name}>
              {gamerCount.name} :{" "}
              <span className="font-semibold">{gamerCount.gold}</span> point
              {gamerCount.gold > 1 ? "s" : ""}
            </div>
          ))}
      </div>

      <hr />

      {!isEnded && (
        <>
          {phase === "waiting" && isAdmin && (
            <div className="flex justify-center m-8">
              <NextStep
                onClick={async () =>
                  await startCountdown({
                    time: gameData.options.countDownTime, //remove
                    roomToken,
                    gameData,
                  })
                }
              >
                Tour suivant
              </NextStep>
            </div>
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
                    className="w-full flex flex-col items-center my-2"
                  >
                    <div className="m-1">{theme}</div>
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
                <div className="m-4">
                  <NextStep onClick={() => setHasValidated(true)}>
                    J&apos;ai fini !
                  </NextStep>
                </div>
              )}
              <div className="h-fit">
                <CountDown
                  finishCountdownDate={finishCountdownDate}
                  onTimeUp={handleTimeUp}
                />
              </div>
            </div>
          )}

          {phase?.startsWith("validating") &&
            themesResponses &&
            Object.keys(themesResponses).length && (
              <>
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
              {winner.name}
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

      <div
        className={`flex justify-center ${
          phase === "searching" && isCompleted
            ? ""
            : "absolute bottom-0  w-full"
        }`}
      >
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
      </div>
    </div>
  );
}
