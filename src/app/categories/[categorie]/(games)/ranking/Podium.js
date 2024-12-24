"use client";

import { useFormState } from "react-dom";
import { useRef, useEffect, useState, useCallback } from "react";

import usePreventScroll from "@/utils/usePreventScroll";
import {
  toggleTarget,
  addTheme,
  addObject,
  goPreTurnFast,
} from "./gameActions";

import ToggleCheckbox from "@/components/ToggleCheckbox";
import { StaticNextStep } from "@/components/NextStep";

import { IoPeople } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import { SlBubble } from "react-icons/sl";
import { IoSettingsSharp } from "react-icons/io5";

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

          {!theme && (
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
                className="border border-amber-700 bg-amber-100 mt-2 p-1"
              >
                Envoyer
              </button>
            </form>
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
    </div>
  );
}
