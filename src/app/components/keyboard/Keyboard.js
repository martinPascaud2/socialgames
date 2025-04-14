"use client";

import { useRef, useEffect } from "react";
import ReactDOM from "react-dom";

import { FaCheck } from "react-icons/fa";
import { FiDelete } from "react-icons/fi";

const frenchLayout = [
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P", "Delete"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M", "Enter"],
  ["W", "X", "C", "Space", "V", "B", "N"],
];

export default function Keyboard({
  setInput,
  onClose,
  onValidate,
  bottomBarSize,
}) {
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
            zIndex: 90,
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

      <div
        className={`fixed bottom-0 w-full bg-black`}
        style={{
          height: `${bottomBarSize / 4 || 2}rem`,
          pointerEvents: "auto",
          zIndex: 100,
        }}
      ></div>
    </div>,
    document.body
  );
}
