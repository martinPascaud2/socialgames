"use client";

import Image from "next/image";

import { categories, subCategories } from "@/assets/globals";

export default function GameChooser({
  adminSelectedCategorie,
  setAdminSelectedCategorie,
  adminSearchtCategorie,
  adminSelectedGame,
  setAdminSelectedGame,
}) {
  const currCat = categories.filter((categorie) => categorie.name !== "APPLI");

  if (!adminSearchtCategorie)
    return (
      <div className="overflow-hidden relative h-full w-[80%] flex flex-col justify-around items-center p-2">
        {currCat.map((categorie, index) => {
          return (
            <div
              key={index}
              onClick={() => setAdminSelectedCategorie(categorie.subCats)}
              className={`absolute ${
                adminSelectedCategorie
                  ? adminSelectedCategorie !== categorie.subCats
                    ? "opacity-50"
                    : "scale-110"
                  : ""
              }`}
              style={{
                top: `${Math.floor(index / 2) * 33 + 5}%`,
                left: index % 2 === 0 && "8%",
                right: index % 2 === 1 && "8%",
                width: "33.333333%",
                aspectRatio: "1 / 1",
              }}
            >
              <Image
                src={categorie.src}
                alt={`${categorie.name} image`}
                className="max-h-full aspect-square"
                style={{ objectFit: "contain" }}
                width={500}
                height={500}
              />
            </div>
          );
        })}
      </div>
    );
  else
    return (
      <div className="overflow-hidden relative h-full w-[80%] flex flex-col justify-around items-center p-2">
        {subCategories[adminSearchtCategorie].map((subCat, i) => (
          <div
            key={i}
            onClick={() => setAdminSelectedGame(subCat)}
            className={`p-4 text-2xl ${
              adminSelectedGame?.name === subCat?.name &&
              "outline outline-2 font-semibold"
            }`}
          >
            {subCat.name}
          </div>
        ))}
      </div>
    );
}
