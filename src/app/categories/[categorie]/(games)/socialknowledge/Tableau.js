"use client";

import { useCallback, useEffect, useMemo, useState, useRef, use } from "react";
import React from "react";

import shuffleArray from "@/utils/shuffleArray";
import {
  startGame,
  sendResponse,
  sendSortedResponses,
  sendSecondSorted,
  writtingComeBack,
  firstSubmitComeBack,
  getGamerFirstTurnSorted,
  seeRevelation,
  adminRevelate,
  getAllSortedResponses,
  goResult,
} from "./gameActions";

import getAreSimilar from "./getAreSimilar";

import NextStep from "@/components/NextStep";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MultiBackend } from "react-dnd-multi-backend";
import { TouchBackend } from "react-dnd-touch-backend"; // For touch support
// import { MultiBackend, DndProvider, Preview } from "react-dnd-multi-backend";
// import { Preview } from "react-dnd-multi-backend";
import { DndProvider } from "react-dnd";
import { useDrag, useDrop } from "react-dnd";
// import { generatePreview } from "@/components/DND/generatePreview";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { usePreview } from "react-dnd-preview";

import {
  CheckIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDoubleRightIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";

import ClickableCountDown from "@/components/ClickableCountdown";

const ItemType = "COLUMN_ITEM";

const MyPreview = ({ dimensions }) => {
  const preview = usePreview();

  if (!preview.display) {
    return null;
  }

  const { itemType, item, style } = preview;

  return (
    <td
      className="item-list__item flex justify-center items-center w-fit border border-black bg-green-100 p-2 text-center h-16 shadow-[inset_0_0_0_1px_#16a34a]"
      style={{
        ...style,
        width: dimensions.width,
      }}
    >
      {item.label}
    </td>
  );
};

const DraggableItem = ({
  item,
  index,
  moveItem,
  clickMoveFromIndex,
  setClickMoveFromIndex,
  goodResponse,
  isBlocked,
  correctionLocked,
}) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { index, label: item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    // hover: (draggedItem) => {
    drop: (draggedItem) => {
      if (draggedItem.index !== index && !isBlocked && !correctionLocked) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
        setClickMoveFromIndex();
      }
    },
  });

  const moveByClick = () => {
    if (isBlocked || correctionLocked) return;
    if (clickMoveFromIndex === undefined) setClickMoveFromIndex(index);
    else {
      moveItem(clickMoveFromIndex, index);
      setClickMoveFromIndex();
    }
  };

  return (
    <>
      <td
        ref={(node) => ref(drop(node))}
        style={{
          padding: "0px",
          margin: "",
          // border:
          //   clickMoveFromIndex !== index && !isDragging
          //     ? "1px solid black"
          //     : "2px solid #16a34a",
          backgroundColor:
            goodResponse === undefined
              ? clickMoveFromIndex === index || correctionLocked === true
                ? // clickMoveFromIndex === index
                  "#dcfce7"
                : "#f3f4f6"
              : goodResponse
              ? "#dcfce7"
              : "#fee2e2",
          borderBottomWidth: "0px",

          // #f0fdf4
        }}
        className={`flex flex-col text-center items-center justify-center w-full h-16 overflow-hidden mt-6 border border-black`}
        onClick={() => moveByClick()}
      >
        {item}
      </td>
    </>
  );
};

const DraggableColumn = ({
  items,
  moveItem,
  gamersNames,
  otherGamersNames,
  allResponses,
  phase,
  theme,
  firstTurnSorted,
}) => {
  const [dimensions, setDimensions] = useState();
  const dimensionsRef = useRef(null);

  const [clickMoveFromIndex, setClickMoveFromIndex] = useState();

  const [badResponses, setBadResponses] = useState();
  const [correctionLockeds, setCorrectionLockeds] = useState();

  useEffect(() => {
    if (dimensionsRef.current) {
      const { width, height } = dimensionsRef.current.getBoundingClientRect();
      if (width !== 0 && height !== 0) setDimensions({ width, height });
    }
  }, [setDimensions]);

  useEffect(() => {
    if (!firstTurnSorted || !gamersNames || !allResponses) return;

    // let badResponses = 0;
    let badResponses = {};
    gamersNames.forEach((name) => {
      badResponses[name] = 0;
    });

    let correctionLockeds = {};

    Object.entries(firstTurnSorted).forEach(([th, responses]) => {
      let passedGamerIndex = 0;
      responses.forEach((response, gamerIndex) => {
        if (response !== null) {
          if (
            !getAreSimilar(response, allResponses[th][gamersNames[gamerIndex]])
          ) {
            badResponses[gamersNames[gamerIndex]] += 1;
            if (th === theme)
              correctionLockeds[gamerIndex - passedGamerIndex] = false;
          } else {
            // correctionLockeds[theme] = false;
            if (th === theme)
              correctionLockeds[gamerIndex - passedGamerIndex] = true;
          }
        } else {
          passedGamerIndex = 1;
        }

        // if (
        //   response !== null &&
        //   !getAreSimilar(response, allResponses[theme][gamersNames[gamerIndex]])
        //   // response !== allResponses[theme][gamersNames[gamerIndex]]
        // ) {
        //   badResponses[gamersNames[gamerIndex]] += 1;
        //   correctionLockeds[gamerIndex] = true;
        // } else {
        //   correctionLockeds[gamerIndex] = false;
        // }
      });
    });
    setBadResponses(badResponses);
    phase === "secondChance_withCorrection" &&
      setCorrectionLockeds(correctionLockeds);
  }, [firstTurnSorted, allResponses, gamersNames]);

  return (
    <>
      {/* <DndProvider backend={MultiBackend} options={HTML5toTouch}> */}
      <DndProvider backend={TouchBackend} options={{ HTML5toTouch }}>
        {/* <tr className="absolute top-0 h-4 w-full flex justify-center border border-b-0 border-black">
          <th className="h-full flex justify-center items-center">coucou</th>
        </tr> */}
        {/* <tr className="flex flex-col w-0">
          <th className="h-full flex justify-center items-center">coucou</th>
        </tr> */}
        {/* <tr>
          <th colspan="2">Titre fusionné</th>
        </tr> */}
        <tr ref={dimensionsRef} className="w-full h-full">
          {items.map((item, index) => {
            let goodResponse;
            if (phase === "no_chance") {
              // goodResponse =
              //   item === allResponses[theme][otherGamersNames[index]];
              goodResponse = getAreSimilar(
                item,
                allResponses[theme][otherGamersNames[index]]
              );
            }
            return (
              <React.Fragment key={index}>
                {/* <th className="absolute">coucou</th> */}
                {/* <td className="absolute left-[50%] translate-x-[-50%] w-full h-[25px] px-[9px] text-center bg-gradient-to-r bg-blue-300 from-gray-100 to-gray-100 via-transparent"> */}
                <td className="absolute left-[50%] translate-x-[-50%] w-full h-[25px] px-[9px] bg-gradient-to-r bg-blue-300 from-gray-100 to-gray-100 via-transparent">
                  {/* <div className="outline outline-1 outline-gray-300"> */}
                  <div className="flex outline outline-1 outline-black justify-center w-full">
                    {/* {gamersNames[index]} */}
                    <div className="text-center relative">
                      {otherGamersNames[index]}
                      <div className="absolute top-0 translate-x-[100%] w-full flex">
                        {badResponses &&
                          Array.from(
                            { length: badResponses[otherGamersNames[index]] },
                            (_, i) => (
                              <div key={`${index}-${i}`}>
                                <XMarkIcon className="w-6 h-6 text-red-600" />
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  </div>
                </td>
                <DraggableItem
                  key={index}
                  item={item}
                  index={index}
                  moveItem={moveItem}
                  clickMoveFromIndex={clickMoveFromIndex}
                  setClickMoveFromIndex={setClickMoveFromIndex}
                  // setDimensions={setDimensions}
                  goodResponse={goodResponse}
                  isBlocked={phase === "no_chance"}
                  correctionLocked={correctionLockeds?.[index]}
                />
              </React.Fragment>
            );
          })}

          {phase !== "no_chance" && <MyPreview dimensions={dimensions} />}
        </tr>
      </DndProvider>
    </>
  );
};

const Revelator = ({
  allResponsesByUser,
  gamersNames,
  allThemes,
  roomId,
  roomToken,
  gameData,
  isAdmin,
}) => {
  const [currentGamerIndex, setCurrentGamerIndex] = useState(0);
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isReadyForNextGamer, setIsReadyForNextGamer] = useState(false);
  const [isRevelationEnded, setIsRevelationEnded] = useState(false);
  const [allSortedResponses, setAllSortedResponses] = useState();
  const [goodResponses, setGoodResponses] = useState({});

  useEffect(() => {
    if (!isRunning || !isAdmin) return;

    const interval = setInterval(async () => {
      // setCurrentThemeIndex((prevIndex) => prevIndex + 1);
      await adminRevelate({ roomId, roomToken, gameData });
    }, 2000);

    return () => clearInterval(interval);
  }, [isRunning, currentThemeIndex, roomId, roomToken, gameData, isAdmin]);

  useEffect(() => {
    const currentThemeIndex = gameData.revelationIndexes?.currentThemeIndex;
    const currentGamerIndex = gameData.revelationIndexes?.currentGamerIndex;
    setCurrentThemeIndex(currentThemeIndex);
    setCurrentGamerIndex(currentGamerIndex);
    if (currentThemeIndex >= allThemes.length - 1) {
      setIsRunning(false);
      setIsReadyForNextGamer(true);
      if (currentGamerIndex >= gamersNames.length - 1) {
        setIsRevelationEnded(true);
      }
    }
  }, [gameData, allThemes.length, gamersNames.length]);

  useEffect(() => {
    const get = async () => {
      const sortedResponses = await getAllSortedResponses({
        gamers: gameData.gamers,
        gamersNames,
        options: gameData.options,
      });
      setAllSortedResponses(sortedResponses);
    };
    get();
  }, [gameData, gamersNames]);

  const actualResponse =
    allResponsesByUser[gamersNames[currentGamerIndex]]?.[
      allThemes[currentThemeIndex]
    ];

  useEffect(() => {
    if (!allSortedResponses) return;
    const goodResponses = {};
    gamersNames.forEach((name) => {
      goodResponses[name] = 0;
    });

    Object.entries(allSortedResponses)
      .sort(([userNameA], [userNameB]) => userNameA.localeCompare(userNameB))
      .forEach(([name, gamerResponses]) => {
        Object.entries(gamerResponses)
          .sort(([themeA], [themeB]) => themeA.localeCompare(themeB))
          .forEach(([theme, responses], themeIndex) => {
            responses.forEach((response, forThisGamerIndex) => {
              const countThisOne =
                // forThisGamerIndex < currentGamerIndex ||
                forThisGamerIndex === currentGamerIndex &&
                themeIndex <= currentThemeIndex;
              // if (
              //   response ===
              //     allResponsesByUser[gamersNames[forThisGamerIndex]][theme] &&
              //   countThisOne
              // ) {
              if (
                getAreSimilar(
                  response,
                  allResponsesByUser[gamersNames[forThisGamerIndex]][theme]
                ) &&
                countThisOne
              ) {
                goodResponses[name] += 1;
              }
            });
          });
      });

    setGoodResponses(goodResponses);
  }, [
    allSortedResponses,
    gamersNames,
    allResponsesByUser,
    currentGamerIndex,
    currentThemeIndex,
  ]);

  return (
    <>
      {isAdmin &&
        (!isRevelationEnded ? (
          <button
            onClick={() => {
              setIsRunning(!isRunning);
              setIsReadyForNextGamer(false);
            }}
            className="border border-blue-400 bg-blue-100 p-1 text-blue-400"
          >
            {!isRunning ? (
              !isReadyForNextGamer ? (
                <ChevronRightIcon className="w-8 h-8" />
              ) : (
                <ChevronDoubleRightIcon className="w-8 h-8" />
              )
            ) : (
              <PauseIcon className="w-8 h-8" />
            )}
          </button>
        ) : (
          <button
            onClick={() => goResult({ roomId, roomToken, gameData })}
            className="border border-blue-400 bg-blue-100 text-blue-400 p-2"
          >
            Résultats
          </button>
        ))}

      {/* <button
        onClick={() => setIsRunning(!isRunning)}
        className="border border-blue-400 bg-blue-100 p-2 text-blue-400"
      >
        {!isRunning ? "Afficher" : "Pause"}
      </button> */}

      {/* <div className="w-full flex justify-around"> */}
      <div className="flex w-full justify-around flex-wrap p-2 m-2">
        {allSortedResponses &&
          gamersNames.map((name, index) => {
            const isWaitingBeginning =
              currentGamerIndex === undefined ||
              currentThemeIndex === undefined;
            const gamerResponseForCurrent =
              allSortedResponses[name]?.[allThemes[currentThemeIndex]]?.[
                currentGamerIndex
              ];
            const isTheOne = gamerResponseForCurrent === null;
            // const isRight = gamerResponseForCurrent === actualResponse;
            const isRight = getAreSimilar(
              gamerResponseForCurrent,
              actualResponse
            );

            return (
              <div key={index}>
                <div
                  className={`text-center ${
                    isTheOne || !actualResponse
                      ? // isTheOne
                        "text-black"
                      : isRight
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  // className={`text-center`}
                >
                  {name}
                </div>
                <div className="flex h-6">
                  {Array.from({ length: goodResponses[name] }, (_, i) => (
                    <div key={`${index}-${i}`}>
                      <CheckIcon className="w-6 h-6" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      <table className="flex flex-col items-center justify-center w-full border-b border-black">
        <thead className="w-full">
          <tr className="w-full flex justify-around">
            {allThemes.map((theme) => (
              <th
                scope="row"
                key={theme}
                className="flex-1 flex items-end justify-center"
              >
                {theme}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="w-full flex flex-col">
          {Object.entries(allResponsesByUser)
            .sort(([userNameA], [userNameB]) =>
              userNameA.localeCompare(userNameB)
            )
            .map(([gamer, responses], gamerIndex) => {
              return (
                <tr key={gamer} className="flex justify-around">
                  {Object.entries(responses).map(
                    ([theme, response], themeIndex) => {
                      const show =
                        gamerIndex < currentGamerIndex ||
                        (gamerIndex === currentGamerIndex &&
                          themeIndex <= currentThemeIndex);

                      return (
                        <React.Fragment key={themeIndex}>
                          <td className="absolute left-[50%] translate-x-[-50%] w-full h-[25px] px-[9px] text-center bg-gradient-to-r bg-blue-300 from-gray-100 to-gray-100 via-transparent ">
                            <div className="outline outline-1 outline-black">
                              {gamer}
                            </div>
                          </td>
                          <td
                            key={theme}
                            style={{
                              borderBottomWidth: "0px",
                            }}
                            className="flex items-center justify-center w-full h-16 text-center mt-6 border border-black"
                          >
                            {!show ? "" : response}
                          </td>
                        </React.Fragment>
                      );
                    }
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </>
  );
};

export default function Tableau({ roomId, roomToken, user, gameData }) {
  const {
    phase,
    enhanced,
    randoms,
    allResponses,
    allResponsesByUser,
    gamersNames,
    finishCountdownDate,
  } = gameData;
  const isAdmin = gameData.admin === user.name;
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [otherGamersResponses, setOtherGamersReponses] = useState();
  const [hasClickedOnCountdown, setHasClickedOnCountdown] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [isValidationSaved, setIsValidationSaved] = useState(false);
  const [isWantNext, setIsWantNext] = useState(false);
  const [firstTurnSorted, setFirstTurnSorted] = useState();

  const [isComingBack, setIsComingBack] = useState(true);
  const [message, setMessage] = useState("");

  const allThemes = [...enhanced, ...randoms].sort(); // useMemo ?

  useEffect(() => {
    if (phase === "sorting") {
      const filteredResponses = Object.fromEntries(
        Object.entries(allResponses).map(([category, responses]) => [
          category,
          Object.fromEntries(
            Object.entries(responses).filter(([name]) => name !== user.name)
          ),
        ])
      );

      let otherGamersResponses = {};
      for (const [theme, responses] of Object.entries(filteredResponses)) {
        let themeResponses = shuffleArray(Object.values(responses));
        otherGamersResponses[theme] = themeResponses;
      }
      setOtherGamersReponses(otherGamersResponses);
    }
  }, [phase, allResponses]);

  useEffect(() => {
    setHasClickedOnCountdown(false);
  }, [otherGamersResponses]);
  useEffect(() => {
    if (!phase) return;
    if (phase !== "sorting") {
      setHasClickedOnCountdown(false);
      setHasValidated(false);
      setIsValidationSaved(false);
    }
  }, [phase]);

  const onValidate = useCallback(() => {
    setHasValidated(true);
  }, []);

  useEffect(() => {
    if (!hasValidated || !user || !phase || hasClickedOnCountdown) return;
    const send = async () => {
      if (phase === "sorting") {
        await sendSortedResponses({
          user,
          sortedResponses: otherGamersResponses,
          gameData,
          roomId,
          roomToken,
        });
      } else if (
        phase == "secondChance_withoutCorrection" ||
        phase === "secondChance_withCorrection"
      ) {
        await sendSecondSorted({
          user,
          secondSorted: otherGamersResponses,
          gameData,
          roomId,
          roomToken,
        });
      }
      setHasValidated(false);
      setIsValidationSaved(true);
    };
    send();
  }, [hasValidated, user, phase, hasClickedOnCountdown]);

  useEffect(() => {
    if (!phase || !gamersNames || !user) return;

    const getSorted = async () => {
      if (
        phase === "secondChance_withoutCorrection" ||
        phase === "secondChance_withCorrection"
      ) {
        const firstTurn = await getGamerFirstTurnSorted({
          gamer: user,
          gamersNames,
        });
        setFirstTurnSorted(firstTurn);
      }
    };
    getSorted();
  }, [phase, gamersNames, user]);

  useEffect(() => {
    const comeBack = async () => {
      if (phase === "waiting") {
        setIsComingBack(false);
      } else if (phase === "writing" && isComingBack === true) {
        const savedWrittenIndex = await writtingComeBack({ user });
        setWrittenIndex(savedWrittenIndex);
        setIsComingBack(false);
        //to do: sorting phase
      } else if (
        (phase === "no_chance" ||
          phase === "secondChance_withoutCorrection" ||
          phase === "secondChance_withCorrection") &&
        isComingBack === true
      ) {
        const otherGamersResponses = await firstSubmitComeBack({ user });
        setOtherGamersReponses(otherGamersResponses);
        setIsComingBack(false);
      }
    };
    comeBack();
  }, [phase, isComingBack, user]);

  const TableauTable = useCallback(
    ({ allResponses, phase, firstTurnSorted }) => {
      const moveItemInColumn = (columnKey, fromIndex, toIndex) => {
        const updatedColumn = [...otherGamersResponses[columnKey]];
        const [movedItem] = updatedColumn.slice(fromIndex, fromIndex + 1);
        const [exchangedItem] = updatedColumn.slice(toIndex, toIndex + 1);
        updatedColumn.splice(toIndex, 1, movedItem);
        updatedColumn.splice(fromIndex, 1, exchangedItem);

        setOtherGamersReponses((prevColumns) => ({
          ...prevColumns,
          [columnKey]: updatedColumn,
        }));
      };

      const otherGamersNames = gamersNames.filter((name) => name !== user.name);

      return (
        <table className="flex flex-col items-center justify-center w-full border-b border-black">
          <thead className="w-full">
            <tr className="w-full flex justify-around">
              {otherGamersResponses &&
                Object.keys(otherGamersResponses).map((columnKey) => (
                  <th
                    scope="row"
                    key={columnKey}
                    className="flex-1 flex items-end justify-center"
                  >
                    {columnKey}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="flex w-full">
            {otherGamersResponses &&
              Object.keys(otherGamersResponses).map((theme, i) => (
                <DraggableColumn
                  key={i}
                  items={otherGamersResponses[theme]}
                  moveItem={(fromIndex, toIndex) =>
                    moveItemInColumn(theme, fromIndex, toIndex)
                  }
                  gamersNames={gamersNames}
                  otherGamersNames={otherGamersNames}
                  allResponses={allResponses}
                  phase={phase}
                  theme={theme}
                  firstTurnSorted={firstTurnSorted}
                />
              ))}
          </tbody>
        </table>
      );
    },
    [gamersNames, otherGamersResponses, user.name]
  );

  return (
    <div className="flex flex-col items-center justify-center p-2 h-full bg-gray-100 relative">
      {phase === "waiting" && (
        <>
          <div>L&apos;admin va lancer la partie...</div>
          {isAdmin && (
            <NextStep
              onClick={() => startGame({ gameData, roomId, roomToken })}
            >
              Lancer
            </NextStep>
          )}
        </>
      )}

      {phase === "writing" && (
        <div className="flex flex-col justify-center items-center h-full">
          {writtenIndex < allThemes.length ? (
            <>
              <div className="font-semibold m-2">{allThemes[writtenIndex]}</div>
              <input
                value={response}
                onChange={(e) => {
                  setResponse(e.target.value);
                  setMessage("");
                }}
                className="border text-center m-2 w-full"
              />
              <div className="w-full m-2 relative">
                <button
                  onClick={() => {
                    if (response.length < 4) setMessage("Réponse trop courte");
                    else {
                      sendResponse({
                        theme: allThemes[writtenIndex],
                        response,
                        gameData,
                        roomId,
                        roomToken,
                        user,
                        isLast: writtenIndex === allThemes.length - 1,
                      });
                      setWrittenIndex((prevIndex) => prevIndex + 1);
                      setResponse("");
                    }
                  }}
                  className="border border-blue-300 bg-blue-100 w-full"
                >
                  Envoyer
                </button>
                <div className="w-full text-center absolute top-8 italic">
                  {message}
                </div>
              </div>
            </>
          ) : (
            <div>En attente des autres joueurs...</div>
          )}
        </div>
      )}

      {phase === "sorting" && (
        <div className="flex flex-col justify-start items-center h-[100vw] w-full">
          <div className="m-4 flex flex-col items-center">
            <div className="font-semibold">
              Trouvez les réponses de chaque joueur !
            </div>
            <div className="font-normal">(glisser ou cliquer)</div>
          </div>
          <div className="mb-4">
            {!hasClickedOnCountdown ? (
              <ClickableCountDown
                finishCountdownDate={finishCountdownDate}
                onTimeUp={onValidate}
                // setHasValidated={setHasValidated}
                onClick={() => setHasClickedOnCountdown(true)}
                isValidationSaved={isValidationSaved}
              />
            ) : (
              <button
                onClick={() => {
                  setHasValidated(true);
                  setHasClickedOnCountdown(false);
                }}
                className={`h-16 w-16 border ${
                  !isValidationSaved
                    ? "border-blue-300 bg-blue-100 text-blue-400"
                    : "border-green-300 bg-green-100 text-green-400"
                } rounded-full`}
              >
                Valider
              </button>
            )}
          </div>

          <TableauTable />
        </div>
      )}

      {phase === "no_chance" && (
        <>
          {!isWantNext ? (
            <button
              onClick={async () => {
                await seeRevelation({ user, gameData, roomId, roomToken });
                setIsWantNext(true);
              }}
              className="border border-blue-400 bg-blue-100 p-2 text-blue-400 mb-2"
            >
              Suite
            </button>
          ) : (
            <div className="mb-2">En attente des autres joueurs...</div>
          )}
          <TableauTable allResponses={allResponses} phase={phase} />
        </>
      )}

      {(phase === "secondChance_withoutCorrection" ||
        phase === "secondChance_withCorrection") && (
        <div className="flex flex-col justify-start items-center h-[100vw] w-full">
          <div className="m-4 flex flex-col items-center">
            <div className="font-semibold">Seconde chance</div>
            <div className="font-normal">(glisser ou cliquer)</div>
          </div>

          <div className="mb-4">
            {!hasClickedOnCountdown ? (
              <ClickableCountDown
                finishCountdownDate={finishCountdownDate}
                onTimeUp={onValidate}
                // setHasValidated={setHasValidated}
                onClick={() => setHasClickedOnCountdown(true)}
                isValidationSaved={isValidationSaved}
              />
            ) : (
              <button
                onClick={() => {
                  setHasValidated(true);
                  setHasClickedOnCountdown(false);
                }}
                className={`h-16 w-16 border ${
                  !isValidationSaved
                    ? "border-blue-300 bg-blue-100 text-blue-400"
                    : "border-green-300 bg-green-100 text-green-400"
                } rounded-full`}
              >
                Valider
              </button>
            )}
          </div>

          <TableauTable
            allResponses={allResponses}
            phase={phase}
            firstTurnSorted={firstTurnSorted}
          />
        </div>
      )}

      {phase === "revelating" && (
        <Revelator
          allResponsesByUser={allResponsesByUser}
          gamersNames={gamersNames}
          allThemes={allThemes}
          roomId={roomId}
          roomToken={roomToken}
          gameData={gameData}
          isAdmin={isAdmin}
        />
      )}

      {phase === "results" && (
        <>
          <div className="font-bold m-2 text-lg">Résultats</div>
          <table>
            {Object.entries(gameData.results)
              .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
              .map(([name, score], i) => (
                <tr key={i} className="gap-8 my-2">
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4">{name}</td>
                  <td className="p-4">
                    {gameData.firstTurnResults && (
                      <td>
                        {"("}
                        {gameData.firstTurnResults[name]}
                        {")"}
                      </td>
                    )}
                  </td>
                  <td className="p-4 font-bold">{score}</td>
                </tr>
              ))}
          </table>
        </>
      )}
    </div>
  );
}