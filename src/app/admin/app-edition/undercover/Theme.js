"use client";

import { useState } from "react";

import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import AddWord from "./AddWord";

export default function Theme({ theme, revalidate }) {
  const [show, setShow] = useState(false);
  return (
    <div className="m-2">
      <button onClick={() => setShow(!show)}>
        <div className="flex font-bold">
          {theme.theme}
          {!show ? (
            <ChevronRightIcon className="h-6 w-5" />
          ) : (
            <ChevronDownIcon className="h-6 w-5" />
          )}
        </div>
      </button>
      {show && (
        <>
          {theme.words.map((word, i) => (
            <div key={i}>{word.word}</div>
          ))}

          <AddWord themeId={theme.id} revalidate={revalidate} />
        </>
      )}
    </div>
  );
}
