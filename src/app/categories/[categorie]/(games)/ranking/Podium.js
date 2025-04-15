"use client";

import ReactDOM, { useFormState } from "react-dom";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";

import usePreventScroll from "@/utils/usePreventScroll";
import {
  toggleTarget,
  addTheme,
  addObject,
  goPreTurnFast,
  adminEditing,
  editValues,
  goTurnPhase,
  sendTops,
  showResults,
} from "./gameActions";

import ToggleCheckbox from "@/components/ToggleCheckbox";
import AnimatedDots from "@/components/AnimatedDots";
import { StaticNextStep } from "@/components/NextStep";
import Keyboard from "@/components/keyboard/Keyboard";
import Input from "@/components/keyboard/Input";
import ControlButton from "@/components/ControlButton";

import { IoPeople } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { SlBubble } from "react-icons/sl";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdArrowDropright } from "react-icons/io";
import { TfiWrite } from "react-icons/tfi";
import Gold from "/public/gold.png";
import Silver from "/public/silver.png";
import Bronze from "/public/bronze.png";

import { TouchBackend } from "react-dnd-touch-backend";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { usePreview } from "react-dnd-preview";
const ItemType = "Item";

const PreparingPhase = ({ gameData, roomId, roomToken, isAdmin, user }) => {
  const { params: userParams } = user;
  const bottomBarSize = userParams?.bottomBarSize || 8;

  const [showedControls, setShowedControls] = useState(false);
  const [showedToggle, setShowedToggle] = useState(false);
  const [showedInfo, setShowedInfo] = useState(false);
  const [input, setInput] = useState("");
  const [showedKeyboard, setShowedKeyboard] = useState(true);

  const { options, theme, objects } = gameData;
  const { target } = options;
  const [checked, setChecked] = useState(target === "players");

  const objectNumber = objects ? Object.keys(objects).length + 1 : 1;

  const handleToggle = useCallback(async () => {
    await toggleTarget({ gameData, roomId, roomToken });
  }, [gameData, roomId, roomToken]);
  useEffect(() => {
    setChecked(target === "players");
  }, [target]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      {isAdmin ? (
        <>
          {!theme && (
            <div
              className={`w-full h-full flex justify-center absolute top-[5%]`}
            >
              {!showedControls ? (
                <StaticNextStep onLongPress={() => setShowedControls(true)}>
                  <div className="text-sm">{"Contrôles"}</div>
                </StaticNextStep>
              ) : (
                <div className="w-full flex justify-around">
                  <ControlButton
                    layout="?"
                    onClick={() => {
                      setShowedInfo(true);
                      setShowedToggle(false);
                    }}
                  />
                  <ControlButton
                    layout="!"
                    onClick={() => {
                      setShowedInfo(false);
                      setShowedToggle(true);
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {!theme && (
            <>
              <div className="absolute top-[12%] flex w-full justify-center items-center h-20">
                {showedToggle && (
                  <>
                    <div className="mr-2 text-sky-700">
                      <IoPeople className="h-8 w-8" />
                    </div>
                    <ToggleCheckbox
                      checked={checked}
                      onChange={handleToggle}
                      colors={{
                        bg: { yes: "#fef3c7", no: "#e0f2fe" },
                        border: { yes: "#b45309", no: "#0369a1" },
                      }}
                      size={70}
                    />
                    <div className="ml-2 text-sky-700">
                      <BsThreeDots className="h-8 w-8" />
                    </div>
                  </>
                )}
                {showedInfo && (
                  <div className="w-fit border rounded-md border-sky-700 bg-sky-100 text-sky-700 p-2 flex flex-col">
                    <div className="text-sky-700 text-sm w-full flex items-center">
                      <IoPeople className="h-8 w-8" />
                      <span>
                        &nbsp;Classez les autres joueurs en fonction du critère
                      </span>
                    </div>
                    <div className="text-sky-700 text-sm w-full flex items-center">
                      <BsThreeDots className="h-8 w-8" />
                      <span>
                        &nbsp;Classez les objets en fonction du critère
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {ReactDOM.createPortal(
                <div
                  className="w-[100vw] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
                  style={{
                    height: `${window.screen.height}px`,
                    zIndex: 100,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="flex justify-center items-center h-8 w-48"
                    style={{
                      pointerEvents: "auto",
                    }}
                  >
                    <Input
                      input={input}
                      openKeyboard={() => setShowedKeyboard(true)}
                      active={showedKeyboard}
                      placeholder="Critère"
                    />
                  </div>
                </div>,
                document.body
              )}

              {showedKeyboard && (
                <Keyboard
                  input={input}
                  setInput={(func) => {
                    setInput((prev) => capitalizeFirstLetter(func(prev)));
                  }}
                  onClose={() => setShowedKeyboard(false)}
                  onValidate={async () => {
                    if (input.length < 4) return;
                    else if (input.length > 15) return;
                    await addTheme({
                      gameData,
                      roomId,
                      roomToken,
                      theme: input,
                    });
                    setInput("");
                  }}
                  bottomBarSize={bottomBarSize}
                />
              )}
            </>
          )}

          {theme && (
            <div className="relative">
              <div
                className={`w-full flex justify-center absolute bottom-full mb-20 ${
                  objectNumber < 4 && "hidden"
                }`}
              >
                <StaticNextStep
                  onClick={() => goPreTurnFast({ gameData, roomId, roomToken })}
                >
                  <div className="text-lg">Suite</div>
                </StaticNextStep>
              </div>

              {ReactDOM.createPortal(
                <div
                  className="w-[100vw] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] flex items-center justify-center"
                  style={{
                    height: `${window.screen.height}px`,
                    zIndex: 100,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="flex justify-center items-center h-8 w-48"
                    style={{
                      pointerEvents: "auto",
                    }}
                  >
                    <Input
                      input={input}
                      openKeyboard={() => setShowedKeyboard(true)}
                      active={showedKeyboard}
                      placeholder={`Objet ${objectNumber}`}
                    />
                  </div>
                </div>,
                document.body
              )}

              {showedKeyboard && (
                <Keyboard
                  input={input}
                  setInput={(func) => {
                    setInput((prev) => capitalizeFirstLetter(func(prev)));
                  }}
                  onClose={() => setShowedKeyboard(false)}
                  onValidate={async () => {
                    if (input.length < 4) {
                      return;
                    } else if (input.length > 15) {
                      return;
                    }
                    await addObject({
                      objectNumber,
                      gameData,
                      roomId,
                      roomToken,
                      object: input,
                    });
                    setInput("");
                  }}
                  bottomBarSize={bottomBarSize}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="h-32 w-full relative pl-28">
          <div className="relative h-full w-full">
            <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
              <SlBubble className="w-16 h-16" />
            </div>
            <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-60%]">
              <IoSettingsSharp
                className="w-8 h-8"
                style={{
                  animation: "spin360 2s linear infinite",
                }}
              />
              <style jsx>{`
                @keyframes spin360 {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
            <div
              className="absolute bottom-0 text-2xl font-bold"
              style={{ right: "calc(50% + 2rem)" }}
            >
              {gameData.admin}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PreturnPhase = ({ gameData, roomId, roomToken, isAdmin, user }) => {
  const { params: userParams } = user;
  const bottomBarSize = userParams?.bottomBarSize || 8;

  const [input, setInput] = useState("");
  const [showedKeyboard, setShowedKeyboard] = useState(false);

  const { theme, objects, adminEdition } = gameData;
  const [isChanging, setIsChanging] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  const [type, setType] = useState("");
  const [objectKey, setObjectKey] = useState("");

  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      <div className="w-full flex flex-col items-center">
        <div className="flex justify-center mb-2.5">
          <div className="flex items-center">
            {isAdmin ? (
              <div
                onClick={() => {
                  if (!isChanging || !isAdmin) return;
                  setType("theme");
                  setIsEditing("theme");
                  setInput(theme);
                  setShowedKeyboard(true);
                  adminEditing({
                    type: "theme",
                    objectKey: null,
                    roomId,
                    roomToken,
                  });
                }}
                className={`font-bold text-3xl border ${
                  !isChanging
                    ? ""
                    : isEditing === null
                    ? "text-amber-700 bg-amber-100"
                    : isEditing !== "theme"
                    ? ""
                    : "text-sky-700 bg-sky-100"
                } px-2 py-0.5`}
                style={{
                  borderColor: !isChanging
                    ? "#f3f4f6" // gray-100
                    : isEditing === null
                    ? "#b45309" // amber-700
                    : isEditing !== "theme"
                    ? "#f3f4f6"
                    : "#0369a1", // sky-700
                }}
              >
                <div className="whitespace-nowrap">{theme}</div>
              </div>
            ) : (
              <div className="flex items-center relative">
                <div
                  className={`font-bold text-3xl border border-dashed ${
                    adminEdition?.type === "theme"
                      ? "text-sky-700 bg-sky-100"
                      : ""
                  } px-2 py-0.5`}
                  style={{
                    borderColor:
                      adminEdition?.type === "theme" ? "#0369a1" : "#f3f4f6", // sky-700 gray-100
                  }}
                >
                  <div className="whitespace-nowrap">{theme}</div>
                </div>
                {adminEdition?.type === "theme" && (
                  <div className="flex items-center absolute left-full">
                    <TfiWrite className="w-5 h-5 ml-1 text-sky-700" />
                    <AnimatedDots color="#0369a1" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {Object.entries(objects).map(([key, value]) => {
          return (
            <div key={key} className="flex justify-center mb-1.5">
              {isAdmin ? (
                <div
                  onClick={() => {
                    if (!isChanging || !isAdmin) return;
                    setType("objects");
                    setObjectKey(key);
                    setInput(value);
                    setIsEditing(key);
                    setShowedKeyboard(true);
                    adminEditing({
                      type: "objects",
                      objectKey: key,
                      roomId,
                      roomToken,
                    });
                  }}
                  className={`flex items-center py-0.5 border pr-2 mr-3 ${
                    !isChanging
                      ? ""
                      : isEditing === null
                      ? "text-amber-700 bg-amber-100"
                      : isEditing !== key
                      ? ""
                      : "text-sky-700 bg-sky-100"
                  } rounded-sm`}
                  style={{
                    borderColor: !isChanging
                      ? "#f3f4f6" // gray-100
                      : isEditing === null
                      ? "#b45309" // amber-700
                      : isEditing !== key
                      ? "#f3f4f6"
                      : "#0369a1", // sky-700
                  }}
                >
                  <IoMdArrowDropright className="w-5 h-5 mt-0.5" />
                  <div className="whitespace-nowrap text-2xl">{value}</div>
                </div>
              ) : (
                <div className="flex items-center relative">
                  <div
                    className={`flex items-center border border-dashed ${
                      adminEdition?.type === "objects" &&
                      adminEdition.objectKey === key
                        ? "text-sky-700 bg-sky-100"
                        : ""
                    } pr-2 py-0.5`}
                    style={{
                      borderColor:
                        adminEdition?.type === "objects" &&
                        adminEdition.objectKey === key
                          ? "#0369a1"
                          : "#f3f4f6", // sky-700 gray-100
                    }}
                  >
                    <IoMdArrowDropright className="w-5 h-5 mt-0.5" />
                    <div className="whitespace-nowrap text-2xl">{value}</div>
                  </div>
                  {adminEdition?.type === "objects" &&
                    adminEdition.objectKey === key && (
                      <div className="flex items-center absolute left-full">
                        <TfiWrite className="w-5 h-5 ml-1 text-sky-700" />
                        <AnimatedDots color="#0369a1" />
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <>
          <div
            className={`mt-4 border ${
              !isChanging
                ? "border-amber-700 bg-amber-100 text-amber-700"
                : "border-sky-700 bg-sky-100 text-sky-700"
            } p-2`}
          >
            <TfiWrite
              onClick={() => setIsChanging(!isChanging)}
              className="w-8 h-8"
            />
          </div>

          <div className="absolute top-24 flex justify-center items-start h-8 w-48">
            <Input
              input={input}
              openKeyboard={() => setShowedKeyboard(true)}
              active={showedKeyboard}
              placeholder=""
              deactivated={isEditing === null}
            />
          </div>
          {showedKeyboard && (
            <Keyboard
              input={input}
              setInput={(func) => {
                setInput((prev) => capitalizeFirstLetter(func(prev)));
              }}
              onClose={() => {
                adminEditing({
                  type: "",
                  objectKey: {},
                  roomId,
                  roomToken,
                });
                setIsChanging(false);
                setIsEditing(null);
                setShowedKeyboard(false);
                setInput("");
              }}
              onValidate={async () => {
                if (input.length < 4) {
                  return;
                } else if (input.length > 15) {
                  return;
                }
                await editValues({
                  gameData,
                  roomId,
                  roomToken,
                  type,
                  newValue: input,
                  objectKey,
                });

                setInput("");
                setIsChanging(false);
                setIsEditing(null);
                setShowedKeyboard(false);
              }}
              bottomBarSize={bottomBarSize}
            />
          )}
        </>
      )}

      {isAdmin && (
        <div className="absolute bottom-10">
          <StaticNextStep
            onClick={() => goTurnPhase({ gameData, roomId, roomToken })}
          >
            Suite
          </StaticNextStep>
        </div>
      )}
    </div>
  );
};

const DraggableItem = ({
  type,
  index,
  value,
  moveItem,
  setDraggedTop,
  draggedTop,
}) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { type, index, value },
    canDrag: !!value,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    // hover: (draggedItem) => {
    drop: (draggedItem) => {
      if (draggedItem.index === index) return;
      moveItem({ draggedItem, to: { type, index, value } });
    },
  });

  useEffect(() => {
    if (isDragging && type === "top") {
      setDraggedTop(index);
    }
    if (!isDragging && type === "top" && draggedTop === index) {
      setDraggedTop(null);
    }
  }, [isDragging, type, setDraggedTop, draggedTop, index]);

  return (
    <div
      ref={(node) => ref(drop(node))}
      className={`text-center text-${
        type === "item" ? "base" : "2xl"
      } border p-2 my-1 border ${
        type !== "top"
          ? !isDragging
            ? "border-amber-700 bg-amber-100 text-amber-700"
            : "border-sky-700 bg-sky-100 text-sky-700"
          : !value
          ? "border-sky-700 bg-sky-100 text-sky-700 border-dashed"
          : !isDragging
          ? "border-amber-700 bg-amber-100 text-amber-700"
          : "border-sky-700 bg-sky-100 text-sky-700 border-dashed"
      }`}
      style={{
        width: type === "item" ? "30%" : "50%",
      }}
    >
      {value || "..."}
    </div>
  );
};

const Preview = ({}) => {
  const preview = usePreview();

  if (!preview.display) {
    return null;
  }

  const { item, style } = preview;
  const { value } = item;

  return (
    <div
      className={`p-2 border border-amber-700 bg-amber-100 text-center text-amber-700 text-${
        item.type === "item" ? "base" : "2xl"
      }`}
      style={{ ...style, width: item.type === "item" ? "30%" : "50%" }}
    >
      {value}
    </div>
  );
};

const TurnPhase = ({ gameData, roomId, roomToken, user }) => {
  const [items, setItems] = useState();
  const [tops, setTops] = useState({});
  const [draggedTop, setDraggedTop] = useState(null);
  const [hasValidated, setHasValidated] = useState(false);

  useEffect(() => {
    if (!gameData.objects) {
      setItems(() => {
        const { gamers } = gameData;
        const filteredGamers = gamers.filter(
          (gamer) => gamer.name !== user.name
        );
        const filteredNames = filteredGamers.map((filtered) => filtered.name);
        return filteredNames;
      });
    } else {
      setItems(Object.values(gameData.objects));
    }
  }, []);

  const moveItem = ({ draggedItem, to }) => {
    if (to.type === "item") return;

    if (draggedItem.type === "item") {
      setTops((prevTops) => {
        const newTops = { ...prevTops };
        newTops[to.index] = draggedItem.value;
        return newTops;
      });

      setItems((prevItems) => {
        const newItems = [...prevItems];
        if (to.value !== undefined) {
          newItems[draggedItem.index] = to.value;
        } else {
          newItems.splice(draggedItem.index, 1);
        }
        return newItems;
      });
    } else if (draggedItem.type === "top") {
      setTops((prevTops) => {
        const newTops = { ...prevTops };
        newTops[to.index] = draggedItem.value;
        newTops[draggedItem.index] = to.value;
        return newTops;
      });
    }
  };

  if (!items) return null;

  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      {(() => {
        const threeTops = Object.keys(tops).length === 3;
        const allTopsDefined = Object.values(tops).every(
          (top) => top !== undefined
        );
        return (
          <div
            onClick={async () => {
              if (!threeTops || !allTopsDefined) return;
              await sendTops({ user, tops, gameData, roomId, roomToken });
              setHasValidated(true);
            }}
            className={`absolute top-20 w-[30%] text-center border ${
              !threeTops || !allTopsDefined
                ? "border-gray-700 bg-gray-100 text-gray-700"
                : !hasValidated
                ? "border-amber-700 bg-amber-100 text-amber-700"
                : "border-green-700 bg-green-100 text-green-700"
            } p-2`}
          >
            Valider
          </div>
        );
      })()}

      <DndProvider backend={TouchBackend} options={{ HTML5toTouch }}>
        <div className="relative w-full h-fit">
          <div className="absolute bottom-full w-full text-center text-3xl font-bold mb-4">
            {gameData.theme}
          </div>

          {["1", "2", "3"].map((top) => {
            return (
              <div key={top} className="flex w-full justify-center">
                <div className="flex justify-center items-center py-1 w-[10%]">
                  <div
                    className={`border h-full w-full flex justify-center items-center ${
                      !tops[top]
                        ? "border-sky-700 bg-sky-100 border-dashed"
                        : "border-amber-700 bg-amber-100"
                    }`}
                  >
                    {(() => {
                      let imgSrc;
                      switch (top) {
                        case "1":
                          imgSrc = Gold;
                          break;
                        case "2":
                          imgSrc = Silver;
                          break;
                        case "3":
                          imgSrc = Bronze;
                          break;
                      }
                      return (
                        <div className="w-8 h-8">
                          <Image
                            alt="place"
                            src={imgSrc}
                            width={500}
                            height={500}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <DraggableItem
                  type="top"
                  index={top}
                  value={tops[top]}
                  moveItem={moveItem}
                  setDraggedTop={setDraggedTop}
                  draggedTop={draggedTop}
                />
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-10 flex flex-wrap justify-around w-full">
          {items.map((item, index) => {
            return (
              <DraggableItem
                key={index}
                type="item"
                index={index}
                value={item}
                moveItem={moveItem}
              />
            );
          })}
        </div>
        <Preview />
      </DndProvider>
    </div>
  );
};

const ResultPhase = ({ gameData, roomId, roomToken, isAdmin }) => {
  const { podium } = gameData;
  const { firsts, seconds, thirds } = podium;

  const [showFirsts, setShowFirsts] = useState(false);
  const [showSeconds, setShowSeconds] = useState(false);
  const [showThirds, setShowThirds] = useState(false);

  useEffect(() => {
    const show = gameData?.show;
    if (!show) return;

    if (show.firsts) setShowFirsts(true);
    if (show.seconds) setShowSeconds(true);
    if (show.thirds) setShowThirds(true);
  }, [gameData]);

  const getPlaceColors = ({ place }) => {
    let lightColor;
    let darkColor;
    switch (place) {
      case "third":
        lightColor = "#ff9936";
        darkColor = "#cd7430";
        break;
      case "second":
        lightColor = "#e0e0e0";
        darkColor = "#9e9e9e";
        break;
      case "first":
        lightColor = "#fee27a";
        darkColor = "#ffbb58";
        break;
    }
    return { lightColor, darkColor };
  };

  const GamerName = useCallback(({ place, isRevelated, name, index }) => {
    const { lightColor: intTextColor, darkColor: extTextcolor } =
      getPlaceColors({ place });

    return (
      <>
        <div
          className={`absolute bottom-full font-bold ${
            place === "third"
              ? "text-xl"
              : place === "second"
              ? "text-2xl"
              : "text-3xl"
          }`}
          style={{
            marginBottom: `${index * 1.5}rem`,
            display: "inline-block",
            clipPath: isRevelated ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            opacity: isRevelated ? 1 : 0,
            transition: "opacity 3s ease-in",
            animation: isRevelated ? "opac 3s ease-in forwards" : "",

            color: intTextColor,
            textShadow: `1px 0px 1px ${extTextcolor}, -1px 0px 1px ${extTextcolor}, 0px 1px 1px ${extTextcolor}, 0px -1px 1px ${extTextcolor}`,
          }}
        >
          {name}
        </div>

        <style jsx>{`
          @keyframes opac {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `}</style>
      </>
    );
  }, []);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      {(() => {
        if (showFirsts || !isAdmin) return null;

        let place;
        if (showSeconds) place = "first";
        else if (showThirds) place = "second";
        else place = "third";
        const { lightColor, darkColor } = getPlaceColors({ place });

        return (
          <div
            onClick={() => showResults({ gameData, roomId, roomToken })}
            className="absolute top-20 border p-2 rounded text-xl font-semibold"
            style={{
              backgroundColor: lightColor,
              color: darkColor,
              borderColor: darkColor,
            }}
          >
            {(() => {
              if (showSeconds) {
                return "Or";
              } else if (showThirds) {
                return "Argent";
              } else {
                return "Bronze";
              }
            })()}
          </div>
        );
      })()}

      <div className="flex justify-center items-end w-full p-4">
        <div className="w-1/3 h-32 flex justify-center items-center bg-gray-600 relative">
          {seconds.map((second, index) => (
            <GamerName
              key={index}
              place="second"
              isRevelated={showSeconds}
              name={second}
              index={index}
            />
          ))}
          <div className="w-10 h-10">
            <Image alt="place" src={Silver} width={500} height={500} />
          </div>
        </div>
        <div className="w-1/3 h-48 flex justify-center items-center bg-gray-600 relative">
          {firsts.map((first, index) => (
            <GamerName
              key={index}
              place="first"
              isRevelated={showFirsts}
              name={first}
              index={index}
            />
          ))}
          <div className="w-10 h-10">
            <Image alt="place" src={Gold} width={500} height={500} />
          </div>
        </div>
        <div className="w-1/3 h-20 flex justify-center items-center bg-gray-600 relative">
          {thirds.map((third, index) => (
            <GamerName
              key={index}
              place="third"
              isRevelated={showThirds}
              name={third}
              index={index}
            />
          ))}
          <div className="w-10 h-10">
            <Image alt="place" src={Bronze} width={500} height={500} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Podium({ roomId, roomToken, user, gameData }) {
  usePreventScroll();
  const isAdmin = gameData.admin === user.name;
  const { phase } = gameData;

  return (
    <div className="relative h-full w-full animate-[fadeIn_1.5s_ease-in-out]">
      {phase === "preparing" && (
        <PreparingPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          isAdmin={isAdmin}
          user={user}
        />
      )}

      {phase === "preturn" && (
        <PreturnPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          isAdmin={isAdmin}
          user={user}
        />
      )}

      {phase === "turn" && (
        <TurnPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          user={user}
        />
      )}

      {phase === "result" && (
        <ResultPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
