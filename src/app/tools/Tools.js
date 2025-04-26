"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import ReactDOM from "react-dom";
import Link from "next/link";

import { audios } from "./audios";

console.log("audios", audios);

import LoadingRoomOctagon from "@/components/Room/LoadingRoomOctagon";
import ThreeSmoke from "@/components/Room/ThreeSmoke";

import { FaCheck } from "react-icons/fa";
import { FiDelete } from "react-icons/fi";

const Buzzer = () => {
  const audio = useRef();
  const [selectedAudio, setSelectedAudio] = useState();

  const handleChooseSound = (e) => {
    setSelectedAudio(e.target.value);
  };

  const handlePlay = () => {
    audio.current && audio.current.play();
    // onPress && onPress(id)
  };

  useEffect(() => {
    if (!selectedAudio) setSelectedAudio(audios[0].value);
  }, [selectedAudio]);

  useEffect(() => {
    if (!selectedAudio) return;
    audio.current = new Audio(`/sounds/${selectedAudio}`);
  }, [selectedAudio]);

  console.log("selectedAudio", selectedAudio);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full relative">
      <select
        onChange={handleChooseSound}
        className="border border-2 border-blue-600 bg-blue-100 text-blue-600 p-2 font-semibold m-2 w-36 rounded-lg"
      >
        {audios.map((audio, i) => (
          <option key={i} value={audio.value} className="text-center">
            {audio.label}
          </option>
        ))}
      </select>
      <button
        onClick={(e) => {
          e.preventDefault();
          handlePlay();
        }}
        className="w-36 h-36 rounded-full border border-2 m-2 border-red-900 bg-red-600 text-red-900 shadow-[inset_0_0px_2rem_0px_#7f1d1d]"
      ></button>
    </div>
  );
};

const frenchLayout = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P", "Delete"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M", "Enter"],
  ["W", "X", "C", "Space", "V", "B", "N"],
];

const Keyboard = ({ setInput, onClose, onValidate, bottomBarSize }) => {
  const keyboardRef = useRef();

  const handleKeyClick = async (key) => {
    if (key === "Space") {
      setInput((prev) => prev + " ");
    } else if (key === "Delete") {
      setInput((prev) => prev.slice(0, -1));
    } else if (key === "Enter") {
      await onValidate();
    } else {
      setInput((prev) => prev + key);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (keyboardRef.current && !keyboardRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="absolute w-screen h-screen"
      style={{
        pointerEvents: "none",
        bottom: 0,
      }}
      ref={keyboardRef}
    >
      <div className="relative w-full h-full">
        <div
          className="absolute bg-gray-900 p-2 w-full"
          style={{
            zIndex: 100,
            pointerEvents: "auto",
            bottom: `${bottomBarSize / 4}rem`,
          }}
        >
          <div className="space-y-2 w-full">
            {frenchLayout.map((row, i) => (
              <div key={i} className="flex justify-between space-x-1">
                {row.map((key) => {
                  let layout;
                  switch (key) {
                    case "Space":
                      layout = " ";
                      break;
                    case "Enter":
                      layout = <FaCheck />;
                      break;
                    case "Delete":
                      layout = <FiDelete />;
                      break;
                    default:
                      layout = key;
                  }
                  return (
                    <button
                      key={key}
                      onClick={() => handleKeyClick(key)}
                      className={`bg-gray-700 text-white font-semibold py-1 px-2 rounded-xl transition relative ${
                        key === "Space" ? "flex-[5]" : "flex-1"
                      }`}
                    >
                      <div className="opacity-0">X</div>
                      <div className="absolute top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%]">
                        {layout}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function Tools({ user }) {
  const { params: userParams } = user;
  const barsSizes = useMemo(
    () => ({
      bottom: userParams?.bottomBarSize || 8,
      top: userParams?.topBarSize || 8,
    }),
    [userParams?.bottomBarSize, userParams?.topBarSize]
  );
  const searchParams = useSearchParams();
  const searchTool = searchParams.get("tool");

  const [hasLoadingOctagonAnimated, setHasLoadingOctagonAnimated] =
    useState(false);
  useEffect(() => {
    setTimeout(() => setHasLoadingOctagonAnimated(true), 2900);
  }, []);

  const [selectedTool, setSelectedTool] = useState(searchTool);

  const [input, setInput] = useState("");

  const selectionClass = (tool) => {
    return `${
      tool === selectedTool
        ? "border border-green-400 bg-green-100 text-green-400 p-2 h-16 w-28 text-center flex items-center justify-center"
        : "border border-blue-400 bg-blue-100 text-blue-400 p-2 h-12 w-24 text-center flex items-center justify-center"
    }`;
  };

  if (!hasLoadingOctagonAnimated)
    return (
      <div
        className="h-screen w-full px-2 overflow-x-hidden bg-black"
        style={{
          paddingTop: `${barsSizes.top / 4}rem`,
          paddingBottom: `${barsSizes.bottom / 4}rem`,
        }}
      >
        <LoadingRoomOctagon isJoinStarted />
      </div>
    );

  return (
    <div
      className="w-full h-full relative"
      style={{
        paddingTop: `${barsSizes.top / 4}rem`,
        paddingBottom: `${barsSizes.bottom / 4}rem`,
      }}
    >
      <ThreeSmoke />

      <div className="absolute z-20">
        <Link
          href={"/categories/?prelobby=true"}
          className="border border-blue-300 bg-blue-100 p-1"
        >
          Retour
        </Link>
      </div>
      <div className="absolute flex items-center justify-around w-full mt-2 z-10">
        <div
          onClick={() => setSelectedTool("buzzer")}
          className={selectionClass("buzzer")}
        >
          Buzzer
        </div>
        <div
          onClick={() => setSelectedTool("keyboard")}
          className={selectionClass("keyboard")}
        >
          Clavier
        </div>
      </div>

      {selectedTool === "buzzer" && <Buzzer />}

      {selectedTool === "keyboard" && (
        <>
          <div className="flex justify-center items-center w-full h-full">
            {input}
          </div>
          <Keyboard
            input={input}
            setInput={setInput}
            onClose={() => setSelectedTool()}
            onValidate={() => {
              console.log("validé");
              setSelectedTool();
            }}
            bottomBarSize={barsSizes.bottom}
          />
        </>
      )}
    </div>
  );
}
