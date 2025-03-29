"use client";

import { useUserContext } from "./Room/Room";

export default function NextStep({ onClick, children }) {
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;

  return (
    <div
      className={`absolute z-30 bottom-0 left-1/2 translate-x-[-50%] translate-y-[-30%] mb-4`}
      style={{ bottom: `${userParams?.bottomBarSize / 4 || 2}rem` }}
    >
      <button
        onClick={onClick}
        className="border border-red-800 bg-red-600 rotate-45 aspect-square"
      >
        <div className="rotate-[-45deg]">{children}</div>
      </button>
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

export function StaticNextStep({ onClick, children }) {
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;

  return (
    <div className="z-30">
      <button
        onClick={onClick}
        className="border border-red-800 bg-red-600 rotate-45 aspect-square"
      >
        <div className="rotate-[-45deg]">{children}</div>
      </button>
    </div>
  );
}
