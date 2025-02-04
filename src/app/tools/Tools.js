"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { audios } from "./audios";

console.log("audios", audios);

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

export default function Tools() {
  const [selectedTool, setSelectedTool] = useState();

  const selectionClass = (tool) => {
    return `${
      tool === selectedTool
        ? "border border-green-400 bg-green-100 text-green-400 p-2 h-16 w-28 text-center flex items-center justify-center"
        : "border border-blue-400 bg-blue-100 text-blue-400 p-2 h-12 w-24 text-center flex items-center justify-center"
    }`;
  };

  console.log("selectedTool", selectedTool);

  return (
    <div className="w-full h-full relative">
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
          onClick={() => setSelectedTool("pas buzzer")}
          className={selectionClass("pas buzzer")}
        >
          Pas buzzer
        </div>
      </div>
      {selectedTool === "buzzer" && <Buzzer />}
    </div>
  );
}
