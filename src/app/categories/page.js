"use client";

import { useState } from "react";
import Link from "next/link";

import classNames from "classnames";

export default function Categories() {
  const [togglingParameters, setTogglingParameters] = useState(false);
  const [toggledParameters, setToggledParameters] = useState(false);

  const handleBgClick = () => {
    setTogglingParameters(!togglingParameters);
    setTimeout(() => {
      setToggledParameters(!toggledParameters);
    }, 1000);
  };

  const categories = [
    { name: "Catégorie 1", href: "/" },
    { name: "Catégorie 2", href: "/" },
    { name: "Catégorie 3", href: "/" },
    { name: "Catégorie 4", href: "/" },
    { name: "Catégorie 5", href: "/" },
    { name: "Catégorie 6", href: "/" },
    { name: "Catégorie 7", href: "/" },
    { name: "Catégorie 8", href: "/" },
  ];

  return (
    <main className="relative h-screen">
      <div
        className={classNames(
          "z-0 absolute h-screen w-screen",
          {
            "transition-opacity ease-in-out duration-1000 opacity-100":
              togglingParameters,
          },
          {
            "transition-opacity ease-in-out duration-1000 opacity-0":
              !togglingParameters,
          }
        )}
        onClick={handleBgClick}
      >
        <Link
          href="/"
          className={classNames(
            { hidden: !togglingParameters && !toggledParameters },
            "absolute w-1/4 text-center border"
          )}
        >
          Paramètres
        </Link>
      </div>

      <div
        className={classNames(
          {
            "transition-opacity ease-in-out duration-1000 opacity-100":
              !togglingParameters,
          },
          {
            "transition-opacity ease-in-out duration-1000 opacity-0":
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
