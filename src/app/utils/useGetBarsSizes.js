"use client";

import { UAParser } from "ua-parser-js";
import { useEffect, useState } from "react";

const useDeviceDetector = () => {
  const [deviceInfo, setDeviceInfo] = useState();

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDeviceInfo(result);
  }, []);

  return deviceInfo;
};

export default function useGetBarsSizes() {
  const deviceInfo = useDeviceDetector();

  const barsSizes = { ...deviceInfo, top: 8, bottom: 8 };
  if (!deviceInfo) return null;

  return barsSizes;
}
