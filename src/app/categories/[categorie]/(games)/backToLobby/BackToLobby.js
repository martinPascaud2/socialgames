"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BackToLobby({ href }) {
  const router = useRouter();

  //   useEffect(() => {
  //     setTimeout(() => router.push(href), 5000);
  //   }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex justify-center items-center">
      {href}
    </div>
  );
}
