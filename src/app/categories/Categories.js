"use client";

import { useState } from "react";
import Link from "next/link";

import classNames from "classnames";

import { categories } from "@/assets/globals";

export default function Categories({ signOut }) {
  const [togglingParameters, setTogglingParameters] = useState(false);
  const [toggledParameters, setToggledParameters] = useState(false);

  const handleBgClick = () => {
    setTogglingParameters(!togglingParameters);
    setTimeout(() => {
      setToggledParameters(!toggledParameters);
    }, 500);
  };

  return (
    <main className="relative h-screen">
      <div
        className={classNames(
          "absolute h-screen w-screen",
          {
            "transition-opacity ease-in-out duration-500 opacity-100":
              togglingParameters,
          },
          {
            "transition-opacity ease-in-out duration-500 opacity-0":
              !togglingParameters,
          }
        )}
        onClick={handleBgClick}
      >
        <Link
          href="/"
          onClick={() => signOut()}
          className={classNames(
            { hidden: !togglingParameters && !toggledParameters },
            "absolute w-1/3 p-3 text-center border"
          )}
        >
          Déconnexion
        </Link>
      </div>

      <div
        className={classNames(
          {
            "transition-opacity ease-in-out duration-500 opacity-100":
              !togglingParameters,
          },
          {
            "transition-opacity ease-in-out duration-500 opacity-0":
              togglingParameters,
          }
        )}
      >
        {categories.map((categorie, index) => (
          <Link
            key={index}
            href={categorie.href}
            className={classNames(
              `absolute w-1/3 p-3 text-center border`,

              {
                hidden: togglingParameters && toggledParameters,
              }
            )}
            style={{
              top: `${Math.floor(index / 2) * 25 + 5}vh`,
              left: index % 2 === 0 && "2rem",
              right: index % 2 === 1 && "2rem",
            }}
          >
            {categorie.name}
          </Link>
        ))}
      </div>
    </main>
  );
}