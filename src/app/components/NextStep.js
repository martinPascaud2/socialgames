"use client";

import { useEffect, useRef, useState } from "react";

import { MdRocketLaunch } from "react-icons/md";
import { IoArrowForward } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { RiRefreshLine } from "react-icons/ri";

import { useUserContext } from "./Room/Room";

const iconsList = {
  startGame: MdRocketLaunch,
  next: IoArrowForward,
  validate: FaCheck,
  again: RiRefreshLine,
};

export default function NextStep({ onClick, onLongPress, iconName, children }) {
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;
  const [content, setContent] = useState();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!iconName) return;
    if (!iconsList[iconName]) return;
    const IconComponent = iconsList[iconName];
    if (!IconComponent) return;
    setContent(<IconComponent className="w-12 h-12" />);
  }, [iconName]);

  const startPress = () => {
    timeoutRef.current = setTimeout(() => {
      onLongPress && onLongPress();
    }, 600);
  };

  const cancelPress = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div
      className={`absolute z-30 left-1/2 translate-x-[-50%] translate-y-[-30%] mb-4`}
      style={{
        bottom: `${userParams?.bottomBarSize / 4 || 2}rem`,
      }}
    >
      <div
        className={`relative w-full aspect-square flex justify-center items-center`}
        onPointerDown={onClick}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
      >
        <div
          className="absolute -inset-[2px]"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            backgroundColor: "#b45309", // amber-700
            zIndex: 0,
          }}
        />

        <div
          className="w-full h-full flex justify-center items-center p-2"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            backgroundColor: "#fef3c7", // amber-100
            color: "#b45309", // amber-700
            zIndex: 1,
          }}
        >
          {!iconName ? children : content}
        </div>
      </div>
    </div>
  );
}

// to be used when logo
export function FixedNextStep({ onClick, children }) {
  const contextValue = useUserContext();

  return (
    <div className="fixed bottom-0 z-10 left-1/2 translate-x-[-50%] translate-y-[-25%]">
      <button
        onClick={() => onClick && onClick()}
        className="border border-red-800 bg-red-600 rotate-45 aspect-square"
      >
        <div className="rotate-[-45deg]">{children}</div>
      </button>
    </div>
  );
}

export function StaticNextStep({ onClick, onLongPress, children }) {
  // const contextValue = useUserContext();
  // const userParams = contextValue.userParams;

  const timeoutRef = useRef(null);

  const startPress = () => {
    timeoutRef.current = setTimeout(() => {
      onLongPress && onLongPress();
    }, 600);
  };

  const cancelPress = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div className="z-30 h-fit aspect-square" style={{ pointerEvents: "auto" }}>
      <button
        onClick={onClick}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
        className="border border-red-800 bg-red-600 aspect-square p-2"
        style={{
          clipPath:
            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
        }}
      >
        <div>{children}</div>
      </button>
    </div>
  );
}

export function ValidateButton({ onClick, onLongPress, iconName, children }) {
  const [content, setContent] = useState();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!iconName) return;
    if (!iconsList[iconName]) return;
    const IconComponent = iconsList[iconName];
    if (!IconComponent) return;
    setContent(<IconComponent className="w-12 h-12" />);
  }, [iconName]);

  const startPress = () => {
    timeoutRef.current = setTimeout(() => {
      onLongPress && onLongPress();
    }, 600);
  };

  const cancelPress = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div>
      <div
        className={`relative w-full aspect-square flex justify-center items-center`}
        onPointerDown={onClick}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchCancel={cancelPress}
      >
        <div
          className={`absolute ${!onLongPress ? "" : "animate-pulse"}`}
          style={{
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            top: !onLongPress ? "-2px" : "-4px",
            right: !onLongPress ? "-2px" : "-4px",
            bottom: !onLongPress ? "-2px" : "-4px",
            left: !onLongPress ? "-2px" : "-4px",
            backgroundColor: "#b45309", // amber-700
            zIndex: 0,
          }}
        />

        <div
          className="w-full h-full flex justify-center items-center p-2"
          style={{
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            background: !onLongPress
              ? "#fef3c7" // amber-100
              : "radial-gradient(#fef3c7 55%, #b45309 100%)", // amber-100 amber-700
            color: "#b45309", // amber-700
            zIndex: 1,
          }}
        >
          {!iconName ? children : content}
        </div>
      </div>
    </div>
  );
}
