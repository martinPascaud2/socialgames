"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import getLocation from "@/utils/getLocation";

export default function GuestInvitation({ searchParams, setCookieToken }) {
  const { categorie, gameName, token } = searchParams;
  const router = useRouter();

  const [guestName, setGuestName] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  const joinGame = async () => {
    try {
      await getLocation();

      if (guestName.length < 3) {
        setServerMessage("Nom trop court");
      } else {
        await setCookieToken("Guest", "guest");

        const guestUrl = `${process.env.NEXT_PUBLIC_APP_URL}/categories/${categorie}/${gameName}/?token=${token}&guestName=${guestName}`;
        router.push(guestUrl);
      }
    } catch (error) {
      setServerMessage(error.message);
      return;
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-screen">
      <input
        onChange={(event) => setGuestName(event.currentTarget.value)}
        className="outline m-4"
      />

      <button
        onClick={async () => await joinGame()}
        className="self-center border border-blue-300 bg-blue-100 w-1/2"
      >
        Rejoindre la partie
      </button>

      <div>{serverMessage}</div>
    </div>
  );
}