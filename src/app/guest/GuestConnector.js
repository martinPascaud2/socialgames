"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { throttle } from "lodash";

import getLocation from "@/utils/getLocation";

import GuestScanner from "./GuestScanner";

export default function GuestConnector() {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [gameUrl, setGameUrl] = useState("");
  const [toggleInput, setToggleInput] = useState(false);
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    setScanning(true);
  }, []);

  const onNewScanResult = useCallback(
    throttle(async (decodedText) => {
      if (scanLocked) return;
      try {
        setGameUrl(decodedText);
        setScanLocked(true);
        setToggleInput(true);
      } catch (error) {
        setServerMessage(error.message);
      }
    }, 10000),
    []
  );

  const joinGame = async () => {
    try {
      await getLocation();
    } catch (error) {
      setServerMessage(error.message);
      return;
    }

    if (guestName.length < 3) {
      setServerMessage("Nom trop court");
    } else {
      const guestUrl = `${gameUrl}&guestName=${guestName}`;
      router.push(guestUrl);
    }
  };

  return (
    <div>
      {!scanLocked && (
        <>
          <div className="text-center">Scanne le QrCode d&apos;une partie</div>
          <GuestScanner
            scanning={scanning}
            fps={10}
            aspectRatio="1.0"
            qrbox={500}
            qrCodeSuccessCallback={onNewScanResult}
          />
        </>
      )}

      {toggleInput && (
        <div className="flex flex-col justify-center">
          <div className="text-center">Choisis ton pseudonyme Guest</div>
          <input
            onChange={(event) => setGuestName(event.currentTarget.value)}
            className="outline m-4"
          />
          <button
            onClick={() => joinGame()}
            className="self-center border border-blue-300 bg-blue-100 w-1/2"
          >
            Rejoindre la partie
          </button>
        </div>
      )}

      <div>{serverMessage}</div>
    </div>
  );
}
