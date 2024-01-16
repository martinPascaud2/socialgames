"use client";

import { useRouter } from "next/navigation";

import { chooseOneMoreGame } from "@/categories/[categorie]/(games)/actionouverite/actions";

export default function ChooseOneMoreGame({ gamers, roomToken }) {
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => {
          const guests = gamers.filter((gamer) => gamer.guest);
          const group = { roomToken, guests, privacy: "private" };
          localStorage.setItem("group", JSON.stringify(group));
          chooseOneMoreGame({ roomToken });
          router.push("/categories?group=true");
        }}
        className="absolute bottom-0 left-0 border border-blue-300 bg-blue-100"
      >
        Nouvelle partie (privée)
      </button>
      <button
        onClick={() => {
          const guests = gamers.filter((gamer) => gamer.guest);
          const group = { roomToken, guests, privacy: "public" };
          localStorage.setItem("group", JSON.stringify(group));
          chooseOneMoreGame({ roomToken });
          router.push("/categories?group=true");
        }}
        className="absolute bottom-0 right-0 border border-blue-300 bg-blue-100"
      >
        Nouvelle partie (publique)
      </button>
    </>
  );
}
