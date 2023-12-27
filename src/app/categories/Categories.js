"use client";

import { useEffect, useState } from "react";
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

  const [topRect, setTopRect] = useState();
  const [bottomRect, setBottomRect] = useState();
  const [topSpace, setTopSpace] = useState();
  const [bottomSpace, setBottomSpace] = useState();

  useEffect(() => {
    const qrZone =
      document !== undefined ? document.getElementById("QR-zone") : null;
    const rect = qrZone?.getBoundingClientRect();
    setTopRect(rect?.top);
    setBottomRect((rect?.bottom).toString());
  }, []);

  useEffect(() => {
    const infosettings =
      document !== undefined ? document.getElementById("infosettings") : null;
    const infosettingsRect = infosettings?.getBoundingClientRect();
    setTopSpace(infosettingsRect.top);
  }, [topRect]);

  useEffect(() => {
    const bottomSide =
      document !== undefined ? document.getElementById("bottom") : null;
    const bottomSideRect = bottomSide?.getBoundingClientRect();

    setBottomSpace((window.innerHeight - bottomSideRect.bottom + 1).toString());
  }, [bottomRect]);

  return (
    <>
      <div
        onClick={handleBgClick}
        className="z-10 absolute h-screen w-screen"
      />

      <main className="relative h-screen">
        <div
          className={classNames(
            "relative h-screen w-screen",
            {
              "transition-opacity ease-in-out duration-500 opacity-100":
                togglingParameters,
            },
            {
              "transition-opacity ease-in-out duration-500 opacity-0":
                !togglingParameters,
            }
          )}
        >
          {/* <Link
            href="/"
            onClick={() => signOut()}
            className={classNames(
              { hidden: !togglingParameters && !toggledParameters },
              "z-20 absolute w-1/3 p-3 text-center border"
            )}
          >
            Déconnexion
          </Link> */}

          <div
            className={`z-20 absolute bg-blue-100 w-1/2 border-r border-black`}
            style={{ height: `${topSpace + 1}px` }}
          />
          <div
            className={`z-20 absolute bg-yellow-100 w-1/2 border-l border-black translate-x-[50vw]`}
            style={{ height: `${topSpace + 1}px` }}
          />

          <div
            className="z-30 absolute bg-blue-100 w-[12.6vw] h-36 skew-y-[45deg] -translate-y-[6.1vw] border-b-2 border-black"
            style={{ top: `${topRect - 144}px` }}
          />
          <div
            className="z-30 absolute bg-yellow-100 w-[12.6vw] h-36 -skew-y-[45deg] -translate-y-[6.1vw] right-0 border-b-2 border-black"
            style={{ top: `${topRect - 144}px` }}
          />

          <div
            id="infosettings"
            className="z-30 absolute bg-blue-100 w-[37.5vw] h-36 translate-x-[12.5vw] border-r border-black"
            style={{ top: `${topRect - 144}px` }}
          >
            infos
          </div>
          <div
            className="z-30 absolute bg-yellow-100 w-[37.5vw] h-36 border-l border-black translate-x-[50vw]"
            style={{ top: `${topRect - 144}px` }}
          >
            settings
          </div>

          <div
            id="QR-zone"
            className=" z-30 absolute top-1/2 left-1/2 -translate-x-1/2	-translate-y-1/2 bg-slate-500 w-[75vw] h-[75vw] border-2 border-black"
          >
            carré central
          </div>

          <div
            className="z-30 absolute bg-red-100 w-[12.6vw] h-36 -skew-y-[45deg] translate-y-[6.1vw] border-t-2 border-black"
            style={{ top: `${bottomRect}px` }}
          />
          <div
            className="z-30 absolute bg-red-100 w-[12.6vw] h-36 skew-y-[45deg] translate-y-[6.1vw] border-t-2 border-black"
            style={{ top: `${bottomRect}px`, right: "0px" }}
          />

          <div
            id="bottom"
            className="z-30 absolute bg-red-100 w-[75vw] h-36 translate-x-[12.5vw] flex flex-col justify-between"
            style={{ top: `${bottomRect}px` }}
          >
            <button className="m-3 p-2">Afficher mon QRCode</button>
            <button className="m-3 p-2">Ajouter un ami</button>
            <button className="m-3 p-2">Rejoindre la partie d'un ami</button>
          </div>

          <div
            className={`z-20 absolute bg-red-100 w-full bottom-0`}
            style={{ height: `${bottomSpace}px` }}
          />
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
                `z-20 absolute w-1/3 p-3 text-center border`,

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
    </>
  );
}
