"use client";

import { useFormState } from "react-dom";
import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

import usePreventScroll from "@/utils/usePreventScroll";
import {
  toggleTarget,
  addTheme,
  addObject,
  goPreTurnFast,
  adminEditing,
  editValues,
  goTurnPhase,
} from "./gameActions";

import ToggleCheckbox from "@/components/ToggleCheckbox";
import AnimatedDots from "@/components/AnimatedDots";
import { StaticNextStep } from "@/components/NextStep";

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

const PreparingPhase = ({ gameData, roomId, roomToken, isAdmin }) => {
  const { options, theme, objects } = gameData;
  const { target } = options;
  const [checked, setChecked] = useState(target === "players");

  const addThemeWith = addTheme.bind(null, {
    gameData,
    roomId,
    roomToken,
  });
  const [themeState, formThemeAction] = useFormState(addThemeWith, {});
  const [themeInputValue, setThemeInputValue] = useState("");
  const [objectInputValue, setObjectInputValue] = useState("");

  const objectNumber = objects ? Object.keys(objects).length + 1 : 1;
  const addObjectWith = addObject.bind(null, {
    objectNumber,
    gameData,
    roomId,
    roomToken,
  });
  const [objectState, formObjectAction] = useFormState(addObjectWith, {});

  const refForm = useRef();
  const objectInputRef = useRef();
  const themeInputRef = useRef();

  const handleToggle = useCallback(async () => {
    await toggleTarget({ gameData, roomId, roomToken });
  }, [gameData, roomId, roomToken]);
  useEffect(() => {
    setChecked(target === "players");
  }, [target]);

  useEffect(() => {
    objectInputRef?.current?.focus();
    themeInputRef?.current?.focus();
  }, [themeInputRef, objectInputRef]);

  return (
    <div className="h-full w-full flex flex-col justify-center items-center relative">
      {isAdmin ? (
        <>
          {!theme && (
            <>
              <div className="absolute top-[5%] flex">
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
              </div>

              <form
                action={async (formData) => {
                  if (themeInputValue.length < 4) return;
                  else if (themeInputValue.length > 15) return;
                  await formThemeAction(formData);
                }}
                className="flex flex-col items-center"
              >
                <label>Critère</label>
                <input
                  ref={themeInputRef}
                  type="text"
                  name="theme"
                  autoFocus
                  onChange={(e) => setThemeInputValue(e.target.value)}
                  className="border focus:outline-none focus:border-2"
                />
                <button
                  type="submit"
                  className="border border-amber-700 bg-amber-100 text-amber-700 mt-2 p-1"
                >
                  Envoyer
                </button>
              </form>
            </>
          )}

          {theme && (
            <div className="relative">
              <div
                className={`w-full flex justify-center absolute bottom-full mb-8 ${
                  objectNumber < 4 && "hidden"
                }`}
              >
                <StaticNextStep
                  onClick={() => goPreTurnFast({ gameData, roomId, roomToken })}
                >
                  <div className="text-lg">Suite</div>
                </StaticNextStep>
              </div>
              <form
                ref={refForm}
                action={async (formData) => {
                  if (objectInputValue.length < 4) {
                    // setMessage("Réponse trop courte");
                    return;
                  } else if (objectInputValue.length > 15) {
                    // setMessage("Réponse trop longue");
                    return;
                  }
                  await formObjectAction(formData);
                  setObjectInputValue("");
                  refForm.current?.reset();
                }}
                className="flex flex-col items-center"
              >
                <label>Objet {objectNumber}</label>
                <input
                  ref={objectInputRef}
                  type="text"
                  name="object"
                  autoFocus
                  onChange={(e) => setObjectInputValue(e.target.value)}
                  className="border focus:outline-none focus:border-2"
                />
                <button
                  type="submit"
                  className="border border-amber-700 bg-amber-100 mt-2 p-1"
                >
                  Envoyer
                </button>
              </form>
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

const PreturnPhase = ({ gameData, roomId, roomToken, isAdmin }) => {
  const { theme, objects, adminEdition } = gameData;
  const [isChanging, setIsChanging] = useState(false);
  const [isEditing, setIsEditing] = useState(null);

  const valueInputRef = useRef();
  const [type, setType] = useState("");
  const [objectKey, setObjectKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const editValuesWith = editValues.bind(null, {
    gameData,
    roomId,
    roomToken,
  });
  const [valuesState, formValuesAction] = useFormState(editValuesWith, {});

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
                  setNewValue(theme);
                  setIsEditing("theme");
                  adminEditing({
                    type: "theme",
                    objectKey: null,
                    roomId,
                    roomToken,
                  });
                  valueInputRef?.current?.focus();
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
                    setNewValue(value);
                    setIsEditing(key);
                    adminEditing({
                      type: "objects",
                      objectKey: key,
                      roomId,
                      roomToken,
                    });
                    valueInputRef?.current?.focus();
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
      )}

      <form
        action={async (formData) => {
          await formValuesAction(formData);
          setIsChanging(false);
          setIsEditing(null);
          valueInputRef?.current?.blur();
        }}
      >
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="objectKey" value={objectKey} />
        <input
          ref={valueInputRef}
          type="text"
          name="newValue"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onBlur={() => {
            adminEditing({
              type: "",
              objectKey: {},
              roomId,
              roomToken,
            });
            setIsChanging(false);
            setIsEditing(null);
          }}
          className="absolute bottom-[200%]"
        />
      </form>

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
      className={`w-[${type === "item" ? "30%" : "50%"}] text-center text-${
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
      className={`w-[${
        item.type === "item" ? "30%" : "50%"
      }] p-2 border border-amber-700 bg-amber-100 text-center text-amber-700 text-${
        item.type === "item" ? "base" : "2xl"
      }`}
      style={{ ...style }}
    >
      {value}
    </div>
  );
};

const TurnPhase = ({ gameData, roomId, roomToken, user, isAdmin }) => {
  const [items, setItems] = useState();
  const [tops, setTops] = useState({});
  const [draggedTop, setDraggedTop] = useState(null);

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
      <div className="absolute top-10">Validation</div>

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

        <div className="absolute bottom-20 flex flex-wrap justify-around w-full">
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

export default function Podium({ roomId, roomToken, user, gameData }) {
  usePreventScroll();
  const isAdmin = gameData.admin === user.name;
  const { phase } = gameData;

  console.log("gameData", gameData);

  return (
    <div className="bg-gray-100 h-full w-full">
      {phase === "preparing" && (
        <PreparingPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          isAdmin={isAdmin}
        />
      )}

      {phase === "preturn" && (
        <PreturnPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          isAdmin={isAdmin}
        />
      )}

      {phase === "turn" && (
        <TurnPhase
          gameData={gameData}
          roomId={roomId}
          roomToken={roomToken}
          user={user}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
