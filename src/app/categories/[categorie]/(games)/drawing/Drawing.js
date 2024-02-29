"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import Draw from "./Draw";

import { sendImage, getPng } from "./gameActions";

export default function Drawing({ roomId, roomToken, user, gameData }) {
  const [imgData, setImgData] = useState("");
  const [svg, setSvg] = useState();
  const [path, setPath] = useState();
  console.log("gameData", gameData);
  const { newImageFrom } = gameData;
  const [receivedImage, setReceivedImage] = useState();

  useEffect(() => {
    console.log("newImageFrom", newImageFrom);
    const get = async () => {
      const newReceivedImage = await getPng({ userName: newImageFrom, roomId });
      setReceivedImage(newReceivedImage);
    };
    newImageFrom && get();
  }, [gameData]);

  console.log("path", path);
  console.log("svg", svg);

  useEffect(() => {
    sendImage({ imgData, roomId, roomToken, gameData, userName: user.name });
  }, [imgData]);

  return (
    <>
      <Draw setImgData={setImgData} setSvg={setSvg} setPath={setPath} />

      <div>Image envoyé de {newImageFrom}</div>

      {receivedImage && <img src={receivedImage} />}

      {/* <div className="flex justify-center w-full">
        <ReactSketchCanvas
          ref={canvasRef}
          style={{
            border: "0.0625rem solid #9c9c9c",
            borderRadius: "0.25rem",
            width: "90%",
            height: "50vh",
          }}
          strokeWidth={strokeWidth}
          eraserWidth={strokeWidth}
          strokeColor={strokeColor}
        />
      </div>
      <div className="flex flex-col items-center">
        <label htmlFor="strokeWidth" className="form-label">
          Epaisseur du trait
        </label>
        <input
          type="range"
          min="3"
          max="11"
          step="2"
          id="strokeWidth"
          value={strokeWidth}
          onChange={(e) => handleStrokeWidthChange(e)}
          className="w-3/4"
        />
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className={`border ${
              !eraseMode ? "border-2 border-blue-500" : "border border-blue-300"
            } bg-blue-100`}
            onClick={() => setEraseMode(false)}
          >
            Pinceau
          </button>
          <button
            type="button"
            className={`border ${
              eraseMode ? "border-2 border-blue-500" : "border border-blue-300"
            } bg-blue-100`}
            onClick={() => setEraseMode(true)}
          >
            Gomme
          </button>
        </div>

        <button
          onClick={() => colorsRef.current.click()}
          className="mt-2 font-semibold"
          style={{ color: strokeColor }}
        >
          Couleur
        </button>

        <input
          id="color"
          ref={colorsRef}
          type="color"
          value={strokeColor}
          onChange={(e) => handleStrokeColorChange(e)}
          className={`${!isIos && "collapse"}`}
        />
      </div>
      <button onClick={() => handleExportImage()}>Télécharger</button>

      <img src={imgData} /> */}
    </>
  );
}
