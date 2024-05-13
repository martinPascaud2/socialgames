"use client";
import { useEffect, useState } from "react";
import { Html5QrcodeScanType, Html5Qrcode } from "html5-qrcode";

import "./Html5QrcodePlugin.css";

const createConfig = (props) => {
  let config = {};

  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  config.supportedScanTypes = [Html5QrcodeScanType.SCAN_TYPE_CAMERA];
  config.rememberLastUsedCamera = true;

  return config;
};

export default function Html5QrcodePlugin(props) {
  const [reader, setReader] = useState();
  const [scan, setScan] = useState();

  useEffect(() => {
    const rea = document.getElementById("reader");
    setReader(rea);
  }, [props]);

  useEffect(() => {
    if (reader) {
      const html5QrCode = new Html5Qrcode("reader");
      const config = createConfig(props);

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        props.qrCodeSuccessCallback
      );

      setScan(html5QrCode);
    }
  }, [props, reader]);

  useEffect(() => {
    const stop = () => scan?.stop();
    stop && props.setStopScan(() => stop);
  }, [scan]);

  return <div id="reader" />;
}
