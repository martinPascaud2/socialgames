"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function BackToLobby({ href }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorie = searchParams.get("categorie");
  const game = searchParams.get("game");

  //   useEffect(() => {
  //     setTimeout(() => router.push(href), 5000);
  //   }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex justify-center items-center">
      {href}
      categorie: {categorie}
      game: {game}
    </div>
  );
}
