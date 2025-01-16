"use client";

import { useState, useEffect } from "react";
import { useWakeLock } from "react-screen-wake-lock";

export default function useWake() {
  const [isVisible, setIsVisible] = useState(true);
  const { isSupported, released, request, release } = useWakeLock({
    onRequest: () => {},
    // onError: () => alert("WakeLock: error"), //check
    onRelease: () => {},
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    // if (request && (released === undefined || released === true) && isVisible) {
    //   request();
    // }
    request && request();

    // return () => {
    //   if (release) release();
    // };
    // }, [request, released, isVisible]);
  }, [request, released, isVisible]);

  return {
    isSupported,
    isVisible,
    released,
    request,
    release,
  };
}
