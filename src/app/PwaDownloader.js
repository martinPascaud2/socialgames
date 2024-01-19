"use client";

import { useEffect, useState } from "react";

const isBrowser = () => typeof window !== "undefined";

export default function PwaDownloader() {
  const [deferredPrompt, setDeferredPrompt] = useState();

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    }
  };

  useEffect(() => {
    if (isBrowser()) {
      window.addEventListener("beforeinstallprompt", (e) => {
        setDeferredPrompt(e);
      });
    }
  }, []);

  if (!deferredPrompt) return null;

  return (
    <button
      onClick={async () => installApp()}
      className="border border-blue-300 bg-blue-100"
    >
      Télécharger l&apos;application
    </button>
  );
}
