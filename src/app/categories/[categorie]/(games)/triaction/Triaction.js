"use client";

import { useState, useEffect, useCallback } from "react";
import "./ripple.css";

import { useLongPress, LongPressEventType } from "use-long-press";
import { aimPlayer, sendActions, sendActionBack } from "./gameActions";

import { vampiro } from "@/assets/fonts";

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
    //   }, [isValidated]);
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
            ? "bg-gray-300"
            : "bg-red-600"
          : "bg-green-600"
      }  text-white overflow-hidden relative cursor-pointer`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isRippling && !longPressed ? (
        <span
          // className="ripple"
          className="absolute w-5 h-5 bg-red-400 block border-0 rounded-full"
          style={{
            animationDuration: "10s",
            animationTimingFunction: "ease",
            animationIterationCount: "1",
            animationFillMode: "forwards",
            // animationName: isRippling ? "ripple-effect" : "",
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

export default function Triaction({ roomId, roomToken, user, gameData }) {
  console.log("gameData", gameData);
  const { phase, gamers, activePlayer, senders } = gameData;
  const isActive = gameData.activePlayer?.id === user.id;
  const [isValidated, setIsValidated] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [aimed, setAimed] = useState();
  const place = gamers.find((gamer) => gamer.name === user.name).place;

  const [actions, setActions] = useState({});
  const [readyActions, setReadyActions] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const [previous, setPrevious] = useState();
  const [selected, setSelected] = useState({});
  const [sentBack, setSentBack] = useState({});
  const [isProposed, setIsProposed] = useState(false); // { aimer, aimed, proposed: {id, action}, hidden: {id, action} }

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
    const userPlace = gamers.find((gamer) => gamer.name === user.name).place;
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

  console.log("actions", actions);
  console.log("aimed", aimed);
  console.log("previous", previous);
  console.log("selected", selected);
  console.log("isProposed", isProposed);
  console.log("isValidated", isValidated);

  const sendBack = async () => {
    setSentBack(selected);
    setIsValidated(false);
    await sendActionBack({ backed: selected, roomToken, gameData });
    setSelected({});
  };

  useEffect(() => {
    if (phase !== "exchange") return;
  }, [actions]);

  const propose = async () => {
    console.log("propose");
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 h-[80vh] w-full">
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
                <div className="flex justify-center m-2">
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
                      className="rounded-md border border-green-300 bg-green-100 px-4 py-2"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => cancel()}
                      className="rounded-md border border-red-300 bg-red-100 px-4 py-2"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              )}
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className="w-full rounded-md border border-slate-300 my-2 p-2 flex flex-col items-center"
                >
                  <label>Action {number}</label>
                  {!showConfirm ? (
                    <textarea
                      rows={2}
                      value={actions[number]}
                      onChange={(e) =>
                        setActions((prevActions) => ({
                          ...prevActions,
                          [number]: e.target.value,
                        }))
                      }
                      className={`${vampiro.className} border focus:outline-none focus:border-2 w-full p-2 m-2 text-center`}
                    />
                  ) : (
                    <div
                      className={`${vampiro.className} w-full p-2 m-2 text-center`}
                    >
                      {actions[number]}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              <div>
                {[...gamers.map((gamer) => gamer.name)]
                  .sort()
                  .map((gamer, i) => {
                    const hasSent =
                      senders.find((sender) => sender.name === gamer) !==
                      undefined;
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
              <div className="m-4">Les joueurs rédigent les actions</div>
            </>
          )}
        </div>
      )}

      {phase === "exchange" && (
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
                    action à rendre à
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold">Rendre</span> cette action à
                  </div>
                )}
                <span className="font-semibold">
                  &nbsp;{previous?.name}&nbsp;.
                </span>
              </div>
              {Object.entries(actions).map((action) => (
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
                    action à proposer à
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
                          aimed,
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
      )}
    </div>
  );
}
