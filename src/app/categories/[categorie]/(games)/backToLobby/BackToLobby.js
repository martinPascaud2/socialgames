"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function BackToLobby({ path }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorie = searchParams.get("categorie");
  const game = searchParams.get("game");

  const href = !path ? `/categories/${categorie}/${game}/` : path;

  useEffect(() => {
    setTimeout(() => router.push(href), 0);
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex justify-center items-center">
      {href}
      categorie: {categorie}
      game: {game}
    </div>
  );
}
