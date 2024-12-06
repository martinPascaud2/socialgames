"use client";

import { useEffect } from "react";

export default function usePreventScroll() {
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();

    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });

    const stayAtTop = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("scroll", stayAtTop);

    return () => {
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("scroll", stayAtTop);
    };
  }, []);
}
