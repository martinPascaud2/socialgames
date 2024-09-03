"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import "./ripple.css";

import { saveData } from "@/components/Room/actions";
import { useLongPress, LongPressEventType } from "use-long-press";
import {
  aimPlayer,
  sendActions,
  sendActionBack,
  proposeAction,
  sendPropositionBack,
} from "./gameActions";

import { vampiro } from "@/assets/fonts";

import NextEndingPossibilities from "@/components/NextEndingPossibilities";

const RipplingButton = ({
  onLongPress,
  isValidated,
  setIsValidated,
  isActive,
}) => {
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
  }, [longPressed, onLongPress]);

  const cancel = () => {
    setLongPressed(false);
  };
  useEffect(() => {
    if (!isValidated) cancel();
  }, [isValidated, isActive]);

  const bind = useLongPress(isActive ? callback : null, {
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
      className={`hold-button rounded-md border-0 w-full px-6 py-4 ${
        !longPressed
          ? !isActive
            ? "bg-slate-400"
            : "bg-red-800"
          : "bg-lime-800"
      }  text-slate-100 overflow-hidden relative cursor-pointer`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isRippling && !longPressed ? (
        <span
          className="absolute w-5 h-5 bg-red-400 block border-0 rounded-full"
          style={{
            animationDuration: "10s",
            animationTimingFunction: "ease",
            animationIterationCount: "1",
            animationFillMode: "forwards",
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

const PendingGamerList = ({ gamers, senders }) => {
  return (
    <div>
      {[...gamers.map((gamer) => gamer.name)].sort().map((gamer, i) => {
        const hasSent =
          senders.find((sender) => sender.name === gamer) !== undefined;
        return (
          <div key={i} className="flex justify-center items-center">
            <div
              className={`w-20 m-2 py-4 px-2 text-center rounded-md border ${
                hasSent
                  ? "border-green-300 bg-green-100"
                  : "border-red-300 bg-red-100"
              }`}
            >
              {gamer}
            </div>
            <div
              className={`w-20 m-2 ${
                hasSent ? "text-green-300" : "text-red-300"
              }`}
            >
              {hasSent ? "Validé" : "En attente"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SlidingCard = ({ onDecision, sender, action }) => {
  const containerRef = useRef(null);
  const [startX, setStartX] = useState(null);
  const [translateX, setTranslateX] = useState(0);

  const windowWidth = Math.floor(window.innerWidth);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setTranslateX(0);
  };

  const handleTouchMove = (e) => {
    if (!startX) return;
    const currentX = e.touches[0].clientX * 1.2;
    const deltaX = currentX - startX;
    setTranslateX(deltaX);
  };

  const handleTouchEnd = () => {
    if (Math.abs(acceptation) < 100) {
      setTranslateX(0);
    } else {
      onDecision({ decision: acceptation < 0 ? "accept" : "refuse" });
    }
  };

  const acceptation = ((translateX * 100) / windowWidth) * 1.5;

  const AcceptText = useCallback(() => {
    return (
      <div className="text-2xl">
        <span
          style={{
            background:
              acceptation >= 0
                ? `linear-gradient(to right, transparent ${acceptation}%, white 0%, white ${
                    100 - acceptation
                  }%)`
                : `linear-gradient(to left, green ${-acceptation}%, white 0%, white ${
                    100 + acceptation
                  }%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {"<< "}ACCEPTER{" <<"}
        </span>
      </div>
    );
  }, [translateX]);

  const RefuseText = useCallback(() => {
    return (
      <div className="text-2xl">
        <span
          style={{
            background:
              acceptation >= 0
                ? `linear-gradient(to right, red ${acceptation}%, white 0%, white ${
                    100 - acceptation
                  }%)`
                : `linear-gradient(to left, transparent ${-acceptation}%, white 0%, white ${
                    100 + acceptation
                  }%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {">> "}REFUSER{" >>"}
        </span>
      </div>
    );
  }, [translateX]);

  return (
    <div className="w-[90%] flex flex-col items-center justify-center">
      <AcceptText />
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.preventDefault()}
        className={`touch-none p-4 bg-white w-full rounded-md border border-slate-300 my-2 flex flex-col items-center`}
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <label>Action proposée par {sender.name}</label>

        <div className={`${vampiro.className} w-full p-2 m-2 text-center`}>
          {action}
        </div>
      </div>
      <RefuseText />
    </div>
  );
};

export default function Triaction({
  roomId,
  roomToken,
  user,
  gameData,
  storedLocation,
}) {
  const { phase, gamers, activePlayer, senders } = gameData;
  const isAdmin = gameData.admin === user.name;
  const isActive = gameData.activePlayer?.id === user.id;
  const [isValidated, setIsValidated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [aimed, setAimed] = useState();
  const place = gamers?.find((gamer) => gamer.name === user.name).place;

  const [actions, setActions] = useState({});
  const [readyActions, setReadyActions] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const [previous, setPrevious] = useState();
  const [selected, setSelected] = useState({});
  const [sentBack, setSentBack] = useState({});
  const [isProposed, setIsProposed] = useState(false);

  const [showChoose, setShowChoose] = useState("backed");
  const [chooseTimeout, setChooseTimeout] = useState();

  const [isEnded, setIsEnded] = useState(false);
  const [hasReload, setHasReload] = useState(false);

  const aim = async ({ aimerPlace, aimed }) => {
    if (aimed.place) return;
    await aimPlayer({ aimerPlace, aimed, roomToken, gameData });
  };

  const validate = () => {
    setShowConfirm(true);
  };

  const confirm = async () => {
    setWaiting(true);
    await sendActions({
      sender: gamers.find((gamer) => gamer.name === user.name),
      aimed,
      sentActions: actions,
      roomToken,
      gameData,
    });
  };

  const cancel = () => {
    setIsValidated(false);
    setShowConfirm(false);
  };

  useEffect(() => {
    const userPlace = gamers?.find((gamer) => gamer.name === user.name).place;
    if (phase === "write") {
      const aimed = gamers.find(
        (gamer) => gamer.place === (userPlace % gamers.length) + 1
      );
      setAimed(aimed);
    } else if (phase === "exchange") {
      setActions(gameData.actions[user.name]);
      const prevPlace = userPlace === 1 ? gamers.length : userPlace - 1;
      const prev = gamers.find((gamer) => gamer.place === prevPlace);
      setPrevious(prev);
      setIsValidated(false);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "write") return;
    let ready = true;
    if (Object.keys(actions).length < 3) ready = false;
    Object.values(actions).forEach((action) => {
      if (action.length < 5) {
        ready = false;
        return;
      }
    });
    setReadyActions(ready);
  }, [actions]);

  const sendBack = async () => {
    setSentBack(selected);
    setIsValidated(false);
    await sendActionBack({
      backed: selected,
      roomToken,
      gameData,
      sender: user.name,
    });
    setSelected({});
  };

  const propose = async () => {
    let hidden;
    for (let key in actions) {
      if (key !== "backed" && key !== sentBack.id && key !== selected.id)
        hidden = { id: key, action: actions[key] };
    }
    setIsProposed(true);
    await proposeAction({
      sender: gamers.find((gamer) => gamer.name === user.name),
      aimedName: aimed.name,
      proposed: selected,
      hidden,
      roomToken,
      gameData,
    });
  };

  useEffect(() => {
    if (phase !== "choose" || showChoose === "waiting") return;
    setChooseTimeout(
      setTimeout(() => {
        setShowChoose("long");
      }, 5000)
    );

    return () => {
      clearTimeout(chooseTimeout);
    };
  }, [phase]);

  const onDecision = ({ decision }) => {
    const proposer = gameData.propositions[user.name].sender;
    let kept;
    let backed;
    if (decision === "accept") {
      kept = gameData.propositions[user.name].proposed;
      backed = gameData.propositions[user.name].hidden;
      setShowChoose("waiting");
    } else {
      kept = gameData.propositions[user.name].hidden;
      backed = gameData.propositions[user.name].proposed;
      setShowChoose("hiddenReveal");
    }

    sendPropositionBack({
      proposer,
      keeper: gamers.find((gamer) => gamer.name === user.name),
      kept,
      backed,
      roomToken,
      gameData,
    });
  };

  useEffect(() => {
    if (showChoose !== "hiddenReveal" || showChoose === "waiting") return;
    setChooseTimeout(
      setTimeout(() => {
        setShowChoose("hiddenLong");
      }, 5000)
    );

    return () => {
      clearTimeout(chooseTimeout);
    };
  }, [showChoose]);

  useEffect(() => {
    if (phase === "finalReveal" || gameData.ended) setIsEnded(true);
  }, [phase, gameData.ended]);

  useEffect(() => {
    if (!isAdmin || !hasReload) return;
    const save = async () => {
      saveData({ roomId, newData: gameData });
    };
    save();
  }, [gameData, hasReload, isAdmin, roomId]);
  useEffect(() => {
    if (hasReload || !gameData) return;

    const reload = async () => {
      setWaiting(senders.some((sender) => sender.name === user.name));
      setActions((prevActions) => {
        if (phase === "write") {
          const storedWrittenActions =
            JSON.parse(localStorage.getItem("SGTriaction_writtenActions")) ||
            {};
          const savedToken = storedWrittenActions.roomToken;
          const savedWrittenActions = storedWrittenActions.actions;
          if (savedToken === roomToken) return savedWrittenActions;
        } else if (phase === "exchange") {
          const actions = { ...gameData.actions[user.name] };
          delete actions.backed;
          return actions;
        }
        return prevActions;
      });
      setSentBack((prevSentBack) => {
        if (gameData.backedActions && gameData.backedActions[user.name])
          return gameData.backedActions[user.name];
        else return prevSentBack;
      });

      const userPlace = gamers?.find((gamer) => gamer.name === user.name).place;

      setAimed(() => {
        const aimed = gamers.find(
          (gamer) => gamer.place === (userPlace % gamers.length) + 1
        );
        return aimed;
      });
      setIsProposed(
        gameData.senders.some((sender) => sender.name === user.name) &&
          phase === "exchange"
      );
      setPrevious(() => {
        const prevPlace = userPlace === 1 ? gamers.length : userPlace - 1;
        const prev = gamers.find((gamer) => gamer.place === prevPlace);
        return prev;
      });
      setShowChoose((prevShow) => {
        if (
          senders.some((sender) => sender.name === user.name) &&
          phase !== "write" &&
          phase !== "exchange"
        )
          return "waiting";
        else return prevShow;
      });

      setHasReload(true);
    };
    reload();
  }, [
    gameData,
    roomId,
    isAdmin,
    actions,
    hasReload,
    user,
    senders,
    gamers,
    phase,
  ]);
  useEffect(() => {
    if (showChoose === "waiting" && chooseTimeout) clearTimeout(chooseTimeout);
  }, [showChoose, chooseTimeout]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative bg-gradient-to-b from-slate-300 to-amber-300 overflow-y-auto">
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
        <div className="w-[90%] m-2 flex flex-col items-center">
          {!waiting ? (
            <>
              <RipplingButton
                onLongPress={validate}
                isValidated={isValidated}
                setIsValidated={setIsValidated}
                isActive={readyActions}
              />

              {!showConfirm ? (
                <div className="flex justify-center m-2 text-slate-900">
                  {!readyActions ? (
                    <div>
                      <span className="font-semibold">Ecris</span> tes trois
                      actions pour{" "}
                      <span className="font-semibold">{aimed?.name} </span>.
                    </div>
                  ) : (
                    <div>
                      <span className="font-semibold">Envoyer</span> les trois
                      actions à{" "}
                      <span className="font-semibold">{aimed?.name} </span>.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col w-[90%]">
                  <div className="flex justify-center text-center m-2">
                    Ces trois gages ne seront plus modifiables, tu confirmes ?
                  </div>
                  <div className="flex justify-evenly w-full">
                    <button
                      onClick={() => confirm()}
                      className="rounded-md border border-lime-800 bg-lime-600 text-slate-100 font-bold tracking-wide px-4 py-2"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => cancel()}
                      className="rounded-md border border-red-800 bg-red-600 text-slate-100 font-bold tracking-wide px-4 py-2"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              )}
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className="w-full rounded-md border border-lime-800 my-3 py-2 px-4 flex flex-col items-center shadow-lg shadow-lime-900 bg-lime-700"
                >
                  <label className="font-bold text-slate-100 tracking-wide">
                    Action {number}
                  </label>
                  {!showConfirm ? (
                    <textarea
                      rows={2}
                      value={actions[number]}
                      onChange={(e) => {
                        const newActions = {
                          ...actions,
                          [number]: e.target.value,
                        };

                        setActions(newActions);
                        localStorage.setItem(
                          "SGTriaction_writtenActions",
                          JSON.stringify({ actions: newActions, roomToken })
                        );
                      }}
                      className={`${vampiro.className} border border-lime-800 focus:outline-none focus:border-lime-800 focus:ring-1 focus:ring-inset focus:ring-lime-800 w-full p-2 m-2 text-center text-lg bg-slate-100 text-slate-900`}
                    />
                  ) : (
                    <div
                      className={`${vampiro.className} w-full p-2 m-2 text-center text-red-900 text-lg bg-lime-100 border-4 border-double border-lime-800`}
                    >
                      {actions[number]}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <PendingGamerList gamers={gamers} senders={senders} />

              <div className="m-4">Les joueurs rédigent les actions</div>
            </>
          )}
        </div>
      )}

      {phase === "exchange" && (
        <>
          {!isProposed ? (
            <>
              {!Object.keys(sentBack).length ? (
                <div className="w-[90%] flex flex-col items-center">
                  <RipplingButton
                    onLongPress={sendBack}
                    isValidated={isValidated}
                    setIsValidated={setIsValidated}
                    isActive={!!selected.id}
                  />
                  <div className="w-full flex text-center justify-center m-2">
                    {!selected.id ? (
                      <div>
                        <span className="font-semibold">Sélectionne</span> une
                        action à <span className="font-semibold">rendre</span> à
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold">Rendre</span> cette
                        action à
                      </div>
                    )}
                    <span className="font-semibold">
                      &nbsp;{previous?.name}&nbsp;.
                    </span>
                  </div>
                  {actions &&
                    Object.entries(actions).map((action) => (
                      <div
                        key={action[0]}
                        onClick={() => {
                          if (
                            Object.keys(selected)?.length &&
                            selected.id === action[0]
                          )
                            setSelected({});
                          else if (!Object.keys(selected)?.length)
                            setSelected({
                              id: action[0],
                              aimed: previous,
                              action: action[1],
                            });
                        }}
                        className={`${
                          selected?.id === action[0] && "bg-green-100"
                        } w-full rounded-md border border-slate-300 my-2 p-2 flex flex-col items-center`}
                      >
                        <label>Action {action[0]}</label>
                        <div
                          className={`${vampiro.className} w-full p-2 m-2 text-center`}
                        >
                          {action[1]}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="w-[90%] flex flex-col items-center">
                  <RipplingButton
                    onLongPress={propose}
                    isValidated={isValidated}
                    setIsValidated={setIsValidated}
                    isActive={!!selected.id}
                  />
                  <div className="w-full flex text-center justify-center flex-wrap m-2">
                    {!selected.id ? (
                      <div>
                        <span className="font-semibold">Sélectionne</span> une
                        action à <span className="font-semibold">proposer</span>{" "}
                        à
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold">Proposer</span> à
                      </div>
                    )}
                    <span className="font-semibold">
                      &nbsp;{aimed?.name}&nbsp;.
                    </span>
                  </div>
                  {Object.entries(actions).map((action) => {
                    if (action[0] === "backed") return;
                    const isBacked = action[0] === sentBack.id;
                    return (
                      <div
                        key={action[0]}
                        onClick={() => {
                          if (isBacked) return;
                          if (
                            Object.keys(selected)?.length &&
                            selected.id === action[0]
                          )
                            setSelected({});
                          else if (!Object.keys(selected)?.length)
                            setSelected({
                              //check
                              id: action[0],
                              action: action[1],
                            });
                        }}
                        className={`${
                          isBacked
                            ? "bg-gray-300"
                            : selected?.id === action[0] && "bg-green-100"
                        } w-full rounded-md border border-slate-300 my-2 p-2 flex flex-col items-center`}
                      >
                        <label>Action {action[0]}</label>
                        <div
                          className={`${vampiro.className} w-full p-2 m-2 text-center`}
                        >
                          {action[1]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <PendingGamerList gamers={gamers} senders={senders} />
              <div className="m-4 text-center">
                Les joueurs renvoient et proposent leurs actions
              </div>
            </>
          )}
        </>
      )}

      {phase === "choose" && (
        <div
          className="w-full h-full flex flex-col justify-center items-center bg-gray-400"
          onClick={() => {
            clearTimeout(chooseTimeout);
            let newChoose;
            if (["backed", "long"].some((moment) => moment === showChoose))
              newChoose = "proposition";
            else if (
              ["hiddenReveal", "hiddenLong"].some(
                (moment) => moment === showChoose
              )
            )
              newChoose = "waiting";
            newChoose && setShowChoose(newChoose);
          }}
        >
          {(showChoose === "long" || showChoose === "backed") &&
            (() => {
              const backed = gameData.actions[user.name].backed;
              const Press = () => {
                if (showChoose === "backed") return null;
                return (
                  <div className="text-white font-bold animate-bounce m-4">
                    APPUIE
                  </div>
                );
              };
              return (
                <>
                  <Press />
                  <div className="w-[90%] rounded-md border border-slate-300 my-2 p-2 flex flex-col items-center bg-white">
                    <label>Action rendue par {aimed?.name}</label>
                    <div
                      className={`${vampiro.className} w-full p-2 m-2 text-center`}
                    >
                      {backed}
                    </div>
                  </div>
                  <Press />
                </>
              );
            })()}

          {showChoose === "proposition" && (
            <SlidingCard
              onDecision={onDecision}
              sender={previous}
              action={gameData.propositions[user.name].proposed.action}
            />
          )}

          {(showChoose === "hiddenReveal" || showChoose === "hiddenLong") &&
            (() => {
              const hidden = gameData.actions[user.name].kept?.action;
              const Press = () => {
                if (showChoose === "hiddenReveal") return null;
                return (
                  <div className="text-white font-bold animate-bounce m-4">
                    APPUIE
                  </div>
                );
              };

              return (
                <>
                  <Press />
                  <div className="w-[90%] rounded-md border border-slate-300 my-2 p-2 flex flex-col items-center bg-white">
                    <label>Action cachée de {previous.name}</label>
                    <div
                      className={`${vampiro.className} w-full p-2 m-2 text-center`}
                    >
                      {hidden}
                    </div>
                  </div>
                  <Press />
                </>
              );
            })()}

          {showChoose === "waiting" && (
            <>
              <PendingGamerList gamers={gamers} senders={senders} />
              <div className="m-4 text-center">
                Les joueurs choissent : l&apos;action visible ou cachée ?
              </div>
            </>
          )}
        </div>
      )}

      {phase === "finalReveal" &&
        (() => {
          const actions = gameData.actions[user.name];
          const backed = {
            label: `Action renvoyée par ${aimed?.name}`,
            action: actions.backed,
          };
          const kept = {
            label: `Proposition de ${previous?.name} acceptée`,
            action: actions.kept.action,
          };
          const proposedBack = {
            label: `Proposition non acceptée par ${aimed?.name}`,
            action: actions.proposedBack.action,
          };

          const FinalCard = ({ data }) => (
            <div className="w-[90%] rounded-md border border-lime-800 my-3 py-2 px-4 flex flex-col items-center shadow-lg shadow-lime-900 bg-lime-700">
              <label className="font-bold text-slate-100 tracking-wide">
                {data.label}
              </label>
              <div
                className={`${vampiro.className} w-full p-2 m-2 text-center text-red-900 text-lg bg-lime-100 border-4 border-double border-lime-800`}
              >
                {data.action}
              </div>
            </div>
          );

          return (
            <>
              <FinalCard data={backed} />
              <FinalCard data={kept} />
              <FinalCard data={proposedBack} />
            </>
          );
        })()}
      <NextEndingPossibilities
        isAdmin={isAdmin}
        isEnded={isEnded}
        gameData={gameData}
        roomToken={roomToken}
        roomId={roomId}
        reset={() => console.log("to be done")}
        storedLocation={storedLocation}
        user={user}
      />
    </div>
  );
}
