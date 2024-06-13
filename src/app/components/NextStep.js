"use client";

import { useUserContext } from "./Room/Room";

export default function NextStep({ onClick, children }) {
  const contextValue = useUserContext();

  return (
    <button
      onClick={onClick}
      className="border border-red-800 bg-red-600 rotate-45 aspect-square"
    >
      <div className="rotate-[-45deg]">{children}</div>
    </button>
  );
}
