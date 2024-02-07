"use client";
import { useEffect, useState } from "react";
import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5Qrcode,
} from "html5-qrcode";

import "./Html5QrcodePlugin.css";

const qrcodeRegionId = "html5qr-code-full-region";

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
  // if (props.aspectRatio) {
  //   config.aspectRatio = props.aspectRatio;
  // }
  config.supportedScanTypes = [Html5QrcodeScanType.SCAN_TYPE_CAMERA];
  return config;
};

export default function Html5QrcodePlugin(props) {
  // if (!props) return;
  const [reader, setReader] = useState();
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const reader = document.getElementById("reader");
    setReader(reader);
  }, [props]);
  console.log("reader", reader);
  useEffect(() => {
    // if (!reader) return <div id="reader" />;
    //   // if (!props.scanning) return;
    //   console.log("reader", reader);
    //   if (reader?.stop && !scanning) {
    //     reader
    //       .stop()
    //       .then((ignore) => {
    //         // QR Code scanning is stopped.
    //       })
    //       .catch((err) => {
    //         // Stop failed, handle it.
    //       });
    //     return;
    //   }

    //   const config = createConfig(props);
    //   const verbose = props.verbose === true;

    //   if (!props.qrCodeSuccessCallback) {
    //     throw "qrCodeSuccessCallback is required callback.";
    //   }

    //   // const html5QrcodeScanner = new Html5QrcodeScanner(
    //   //   qrcodeRegionId,
    //   //   config,
    //   //   verbose
    //   // );
    //   // html5QrcodeScanner.render(
    //   //   props.qrCodeSuccessCallback,
    //   //   props.qrCodeErrorCallback
    //   // );

    //   const html5QrCode = new Html5Qrcode("reader");
    //   const configTEST = {
    //     fps: 10,
    //     aspectRatio: 1.0,
    //     // qrbox: { width: 250, height: 2500 },
    //   };
    //   html5QrCode.start(
    //     { facingMode: "environment" },
    //     configTEST,
    //     props.qrCodeSuccessCallback
    //   );

    //   // return () => {
    //   //   html5QrcodeScanner.clear().catch((error) => {
    //   //     console.error("Failed to clear html5QrcodeScanner. ", error);
    //   //   });
    //   // };
    //   // return () => {
    //   //   html5QrCode.clear().catch((error) => {
    //   //     console.error("Failed to clear html5QrcodeScanner. ", error);
    //   //   });
    //   // };
    if (reader?.stop && !props.scanning) {
      reader
        .stop()
        .then((ignore) => {
          // QR Code scanning is stopped.
        })
        .catch((err) => {
          // Stop failed, handle it.
        });
      setStarted(false);
      return;
    }

    if (reader) {
      const html5QrCode = new Html5Qrcode("reader");
      console.log("html5QrCode", html5QrCode);
      console.log("html5QrCode.element", html5QrCode?.element);
      const configTEST = {
        fps: 10,
        aspectRatio: 1.0,
        // qrbox: { width: 50, height: 50 },
      };

      html5QrCode.start(
        { facingMode: "environment" },
        configTEST,
        props.qrCodeSuccessCallback
      );
      setStarted(true);
      console.log("reader", reader);
    }
    console.log("started", started);
  }, [props, reader]);

  useEffect(() => {
    console.log("props video", props);
    console.log("reader video", reader);
    console.log("started video", started);
    const readerTEST = document?.getElementById("reader");
    console.log("readerTEST", readerTEST);
    console.log(
      "readerTEST.children",
      readerTEST.children,
      typeof readerTEST.children
    );
    console.log(
      "readerTEST.children[0]",
      readerTEST.children[0],
      typeof readerTEST.children[0]
    );

    const videoElementTEST = document.querySelector("video");
    console.log("videoElementTEST", videoElementTEST);
    // }, [started, props, reader]);
  }, [reader, props, started]);

  // return <div id={qrcodeRegionId} />;
  // return <div id="reader" />;
  return <div id="reader" />;
}
