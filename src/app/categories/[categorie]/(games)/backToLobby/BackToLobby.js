"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BackToLobby({ href }) {
  const router = useRouter();

  useEffect(() => {
    router.push(href);
  }, []);

  return <div className="h-screen w-screen bg-black" />;
}
