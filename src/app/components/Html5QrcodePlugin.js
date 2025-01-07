"use client";
import { useEffect, useState } from "react";
import { Html5QrcodeScanType, Html5Qrcode } from "html5-qrcode";

import "./Html5QrcodePlugin.css";

import Spinner from "./spinners/Spinner";

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
    if (!props.scanning) return;
    const rea = document.getElementById("reader");
    rea && setReader(rea);
  }, [props]);

  useEffect(() => {
    if (!props.scanning) return;
    if (reader) {
      const html5QrCode = new Html5Qrcode("reader");
      console.log("html5QrCode", html5QrCode);
      const config = createConfig(props);

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          props.qrCodeSuccessCallback(decodedText);
          html5QrCode.stop();
        }
      );

      setScan(html5QrCode);
    }
  }, [props, reader]);

  useEffect(() => {
    // if (!props.scanning) return;
    const stop = () => scan?.stop();
    console.log("stop", stop);
    stop && props.setStopScan && props.setStopScan(() => stop);
    // stop && props.setStopScan && props.setStopScan(stop);
    // stop &&
    //   props.setStopScan &&
    //   props.setStopScan((prevStop) => {
    //     if (prevStop) return prevStop;
    //     // else return () => stop;
    //     else return stop;
    //   });
    // }, [scan]);
  }, [scan, props]);

  useEffect(() => {
    if (!props.scanning) return;
    // if (!props.scanning && scan) scan.stop();
    // if (!props.scanning && scan) scan.stop();
  }, [props, scan]);

  // if (!props.scanning) return null;
  return (
    <div
      id="reader"
      className="border border-black aspect-square absolute left-1/2 translate-x-[-50%]"
    />
  );
}
