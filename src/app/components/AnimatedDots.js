"use client";

import { useState, useEffect } from "react";

export default function AnimatedDots({ color }) {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length === 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-lg font-bold" style={{ color }}>
      {dots}
    </div>
  );
}
