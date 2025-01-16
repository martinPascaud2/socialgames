"use client";

import { useState, useEffect } from "react";
import { useWakeLock } from "react-screen-wake-lock";

export default function useWake() {
  // const [isVisible, setIsVisible] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
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

  // if (!isSupported) return {};

  return {
    isSupported,
    isVisible,
    released,
    request,
    release,
  };
}

// export default function useWake() {
//   if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
//     navigator.wakeLock.request("screen");
//   }

//   return {};
// }

export function useWakeAAA() {
  const [wakeLock, setWakeLock] = useState(null);
  // const [isSupported, setIsSupported] = useState("wakeLock" in navigator);
  const [isSupported, setIsSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestWakeLock = async () => {
    if (!isSupported) return;
    try {
      const lock = await navigator.wakeLock.request("screen");
      setWakeLock(lock);
      setIsLocked(true);

      lock.addEventListener("release", () => {
        setIsLocked(false);
      });
    } catch (err) {
      console.error("Failed to acquire Wake Lock:", err);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setIsLocked(false);
      } catch (err) {
        console.error("Failed to release Wake Lock:", err);
      }
    }
  };

  // useEffect(() => {
  //   if (isSupported) {
  //     requestWakeLock();
  //   }

  //   return () => {
  //     releaseWakeLock();
  //   };
  // }, [isSupported]);

  const handleClick = () => {
    if (isSupported) {
      requestWakeLock();
    }
  };

  useEffect(() => {
    if (isSupported) {
      document.addEventListener("click", handleClick);
    }

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isSupported]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isLocked) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLocked]);

  return { isSupported, isLocked, requestWakeLock, releaseWakeLock };
}
