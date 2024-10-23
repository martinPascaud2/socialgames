"use client";

import { useCallback, useEffect, useMemo, useState, useRef } from "react";

import shuffleArray from "@/utils/shuffleArray";
import { startGame, sendResponse, writtingComeBack } from "./gameActions";

import NextStep from "@/components/NextStep";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MultiBackend } from "react-dnd-multi-backend";
import { TouchBackend } from "react-dnd-touch-backend"; // For touch support
// import { MultiBackend, DndProvider, Preview } from "react-dnd-multi-backend";
// import { Preview } from "react-dnd-multi-backend";
import { DndProvider } from "react-dnd";
import { useDrag, useDrop } from "react-dnd";
// import { generatePreview } from "@/components/DND/generatePreview";
import { HTML5toTouch } from "@/components/DND/HTML5toTouch";
import { usePreview } from "react-dnd-preview";

const ItemType = "COLUMN_ITEM";

const MyPreview = ({ dimensions }) => {
  const preview = usePreview();

  if (!preview.display) {
    return null;
  }

  const { itemType, item, style } = preview;

  return (
    <td
      className="item-list__item flex justify-center items-center w-fit border border-black bg-green-50 p-2 text-center h-16 shadow-[inset_0_0_0_1px_#16a34a]"
      style={{
        ...style,
        width: dimensions.width,
      }}
    >
      {item.label}
    </td>
  );
};

const DraggableItem = ({
  item,
  index,
  moveItem,
  clickMoveFromIndex,
  setClickMoveFromIndex,
}) => {
  const [{ isDragging }, ref] = useDrag({
    type: ItemType,
    item: { index, label: item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    // hover: (draggedItem) => {
    drop: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
        setClickMoveFromIndex();
      }
    },
  });

  const moveByClick = () => {
    if (clickMoveFromIndex === undefined) setClickMoveFromIndex(index);
    else {
      moveItem(clickMoveFromIndex, index);
      setClickMoveFromIndex();
    }
  };

  return (
    <td
      ref={(node) => ref(drop(node))}
      style={{
        padding: "8px",
        margin: "",
        border:
          clickMoveFromIndex !== index && !isDragging
            ? "1px solid black"
            : "2px solid #16a34a",
      }}
      className={`flex flex-col text-center items-center justify-center w-full h-16 overflow-hidden `}
      onClick={() => moveByClick()}
    >
      {item}
    </td>
  );
};

const DraggableColumn = ({ items, moveItem }) => {
  const [dimensions, setDimensions] = useState();
  const dimensionsRef = useRef(null);

  const [clickMoveFromIndex, setClickMoveFromIndex] = useState();

  useEffect(() => {
    if (dimensionsRef.current) {
      const { width, height } = dimensionsRef.current.getBoundingClientRect();
      if (width !== 0 && height !== 0) setDimensions({ width, height });
    }
  }, [setDimensions]);

  return (
    <>
      {/* <DndProvider backend={MultiBackend} options={HTML5toTouch}> */}
      <DndProvider backend={TouchBackend} options={{ HTML5toTouch }}>
        <tr ref={dimensionsRef} className="w-full h-full">
          {items.map((item, index) => (
            <DraggableItem
              key={index}
              item={item}
              index={index}
              moveItem={moveItem}
              clickMoveFromIndex={clickMoveFromIndex}
              setClickMoveFromIndex={setClickMoveFromIndex}
              // setDimensions={setDimensions}
            />
          ))}
          <MyPreview dimensions={dimensions} />
        </tr>
      </DndProvider>
    </>
  );
};

export default function Tableau({ roomId, roomToken, user, gameData }) {
  const { phase, enhanced, randoms, allResponses, gamersNames } = gameData;
  const isAdmin = gameData.admin === user.name;
  const [writtenIndex, setWrittenIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [otherGamersResponses, setOtherGamersReponses] = useState();

  const [isComingBack, setIsComingBack] = useState(true);
  const [message, setMessage] = useState("");

  const allThemes = [...enhanced, ...randoms]; // useMemo ?

  useEffect(() => {
    if (phase === "sorting") {
      let otherGamersResponses = {};
      for (const [theme, responses] of Object.entries(allResponses)) {
        let themeResponses = shuffleArray(Object.values(responses));
        otherGamersResponses[theme] = themeResponses;
      }
      setOtherGamersReponses(otherGamersResponses);
    }
  }, [phase]);

  useEffect(() => {
    const comeBack = async () => {
      if (phase === "waiting") {
        setIsComingBack(false);
      } else if (phase === "writing" && isComingBack === true) {
        const savedWrittenIndex = await writtingComeBack({ user });
        setWrittenIndex(savedWrittenIndex);
        setIsComingBack(false);
      }
    };
    comeBack();
  }, [phase]);

  const moveItemInColumn = (columnKey, fromIndex, toIndex) => {
    const updatedColumn = [...otherGamersResponses[columnKey]];
    const [movedItem] = updatedColumn.slice(fromIndex, fromIndex + 1);
    const [exchangedItem] = updatedColumn.slice(toIndex, toIndex + 1);
    updatedColumn.splice(toIndex, 1, movedItem);
    updatedColumn.splice(fromIndex, 1, exchangedItem);

    setOtherGamersReponses((prevColumns) => ({
      ...prevColumns,
      [columnKey]: updatedColumn,
    }));
  };

  console.log("gameData", gameData);
  console.log("otherGamersResponses", otherGamersResponses);

  return (
    <div className="flex flex-col items-center justify-center p-2 h-screen bg-gray-100">
      {phase === "waiting" && (
        <>
          <div>L&apos;admin va lancer la partie...</div>
          {isAdmin && (
            <NextStep
              onClick={() => startGame({ gameData, roomId, roomToken })}
            >
              Lancer
            </NextStep>
          )}
        </>
      )}

      {phase === "writing" && (
        <div className="flex flex-col justify-center items-center h-full">
          {writtenIndex < allThemes.length ? (
            <>
              <div className="font-semibold m-2">{allThemes[writtenIndex]}</div>
              <input
                value={response}
                onChange={(e) => {
                  setResponse(e.target.value);
                  setMessage("");
                }}
                className="border text-center m-2 w-full"
              />
              <div className="w-full m-2 relative">
                <button
                  onClick={() => {
                    if (response.length < 4) setMessage("Réponse trop courte");
                    else {
                      sendResponse({
                        theme: allThemes[writtenIndex],
                        response,
                        gameData,
                        roomId,
                        roomToken,
                        user,
                        isLast: writtenIndex === allThemes.length - 1,
                      });
                      setWrittenIndex((prevIndex) => prevIndex + 1);
                      setResponse("");
                    }
                  }}
                  className="border border-blue-300 bg-blue-100 w-full"
                >
                  Envoyer
                </button>
                <div className="w-full text-center absolute top-8 italic">
                  {message}
                </div>
              </div>
            </>
          ) : (
            <div>En attente des autres joueurs...</div>
          )}
        </div>
      )}

      {phase === "sorting" && (
        <div className="flex flex-col justify-start items-center h-[100vw] w-full">
          <div className="m-4 flex flex-col items-center">
            <div className="font-semibold">
              Trouvez les réponses de chaque joueur !
            </div>
            <div className="font-normal">(glisser ou cliquer)</div>
          </div>
          <table className="flex flex-col items-center justify-center w-full">
            <thead className="w-full">
              <tr className="w-full flex justify-around">
                <th scope="col" className="flex-1"></th>

                {otherGamersResponses &&
                  Object.keys(otherGamersResponses).map((columnKey) => (
                    <th
                      scope="row"
                      key={columnKey}
                      className="flex-1 flex items-end justify-center"
                    >
                      {columnKey}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="flex w-full">
              <tr className="flex flex-col w-full">
                {gamersNames.map((name, i) => (
                  <th
                    key={i}
                    className="h-full flex justify-center items-center"
                  >
                    {name}
                  </th>
                ))}
              </tr>
              {otherGamersResponses &&
                Object.keys(otherGamersResponses).map((columnKey) => (
                  <DraggableColumn
                    key={columnKey}
                    items={otherGamersResponses[columnKey]}
                    moveItem={(fromIndex, toIndex) =>
                      moveItemInColumn(columnKey, fromIndex, toIndex)
                    }
                  />
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
