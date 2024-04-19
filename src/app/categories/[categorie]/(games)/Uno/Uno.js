"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

import {
  MultiBackend,
  DndProvider,
  TouchTransition,
  MouseTransition,
  Preview,
} from "react-dnd-multi-backend";

import { useDrag, useDrop } from "react-dnd";
import update from "immutability-helper";
import isEqual from "lodash.isequal";

import FinishGame from "@/components/FinishGame";
import EndGame from "@/components/EndGame";
import ChooseOneMoreGame from "@/components/ChooseOneMoreGame";

import {
  playCard,
  drawCard,
  skipTurn,
  untriggerUnoPhase,
  triggerUnoFail,
  goEnd,
  addCount,
  goNewUnoGame,
} from "./gameActions";

const ITEM_TYPES = ["number", "+2", "reverse", "skip", "joker", "+4"];

const StyledCards = {
  uno: {
    joker: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          backgroundImage:
            "linear-gradient(to top left, red, red), " +
            "linear-gradient(to top right, blue, blue), " +
            "linear-gradient(to bottom left, green, green), " +
            "linear-gradient(to bottom right, yellow, yellow)",
          backgroundSize: "50% 50%",
          backgroundPosition: "top left, top right, bottom left, bottom right",
          backgroundRepeat: "no-repeat",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
          border: `2px solid ${data.color}`,
        }}
      />
    ),
    number: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: data?.color,
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
        }}
      >
        <div>{data?.text}</div>
      </div>
    ),
    skip: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: data?.color,
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
        }}
      >
        <div>skip</div>
      </div>
    ),
    "+2": ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: data?.color,
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
        }}
      >
        <div>+2</div>
      </div>
    ),
    "+4": ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: "#000",
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
          border: `2px solid ${data.color}`,
        }}
      >
        <div>+4</div>
      </div>
    ),
    reverse: ({ ref, index, handlerId, onClick, data }) => (
      <div
        ref={ref}
        index={index}
        data-handler-id={handlerId}
        type="button"
        onClick={onClick}
        style={{
          background: data?.color,
          color: "#fff",
          width: "50px",
          height: "50px",
          padding: "20px",
          margin: "10px",
        }}
      >
        <div>reverse</div>
      </div>
    ),
  },
};

const HTML5toTouch = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

const StageItem = ({
  type,
  id,
  index,
  data,
  moveItem,
  isNewItemAdding,
  onNewAddingItemProps,
  onClick,
  isSelected,
  gameName,
}) => {
  const itemRef = useRef(null);

  const [{ handlerId }, drop] = useDrop({
    // accept: Object.keys(ITEM_TYPES),
    accept: ITEM_TYPES,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!itemRef.current && !itemRef.current?.getBoundingClientRect) {
        return;
      }

      const { top, bottom, height } = itemRef.current.getBoundingClientRect();
      const { y } = monitor.getClientOffset();
      const hoverIndex = index;
      const dragIndex = item.index;

      const hoverMiddleY = (bottom - top) / 2;
      const hoverClientY = y - top;

      if (!id || dragIndex === hoverIndex) {
        return;
      }

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      if (!isNewItemAdding) {
        onNewAddingItemProps({ hoveredIndex: hoverIndex });
        moveItem(dragIndex, hoverIndex);
        item.index = hoverIndex;
      } else {
        const belowThreshold = top + height / 2;
        const newShould = y >= belowThreshold;
        onNewAddingItemProps({
          hoveredIndex: hoverIndex,
          shouldAddBelow: newShould,
        });
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: type,
    item: { type: type, id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(itemRef));

  const opacity = isNewItemAdding && !id ? "0.3" : "1";
  const border = isSelected ? "3px dashed blue" : "1px solid silver";

  if (!gameName) return;
  return (
    <div>
      {StyledCards[gameName][type]({
        handlerId: handlerId,
        ref: itemRef,
        onClick,
        data,
      })}
    </div>
  );
};

const generatePreview = (props) => {
  const { item, style } = props;
  const newStyle = {
    ...style,
  };

  return (
    <div style={newStyle}>
      <StageItem {...item} />
    </div>
  );
};

const HandCard = ({
  index,
  itemType,
  data,
  onClick,
  onNewItemAdding,
  moveCard,
  gameName,
}) => {
  const cardRef = useRef(null);

  const [collected, drop] = useDrop({
    accept: ITEM_TYPES,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!cardRef.current && !cardRef.current?.getBoundingClientRect) {
        return;
      }

      const { top, bottom, height } = cardRef.current.getBoundingClientRect();
      const { y } = monitor.getClientOffset();
      const hoverIndex = index;
      const dragIndex = item.index;

      const hoverMiddleY = (bottom - top) / 2;
      const hoverClientY = y - top;

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, dragRef] = useDrag({
    type: itemType,
    item: { type: itemType, data, gameName, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    onNewItemAdding(isDragging);
  }, [isDragging, onNewItemAdding]);

  dragRef(drop(cardRef));

  return (
    <div>
      {StyledCards[gameName][itemType]({
        ref: cardRef,
        index,
        handlerId: collected.handlerId,
        onClick,
        data,
      })}
    </div>
  );
};

const Hand = ({
  addNewItem,
  onNewItemAdding,
  selectedItem,
  gamerItems,
  setHandItems,
}) => {
  const [handCards, setHandCards] = useState(gamerItems);

  useEffect(() => {
    setHandItems(handCards);
  }, [handCards]);

  const moveCard = useCallback(
    (dragIndex, hoverIndex) => {
      const dragItem = handCards[dragIndex];
      setHandCards(
        update(handCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragItem],
          ],
        })
      );
    },
    [handCards, setHandCards]
  );

  const HandCards = useMemo(
    () =>
      handCards.map((item, index) => {
        const { type, data, gameName } = item;
        return (
          <HandCard
            // key={itemType}
            index={index}
            // key={item.type}
            key={index}
            type="button"
            itemType={type}
            // text={item.text}
            data={item.data}
            // onClick={() => addNewItem(itemType, selectedItem?.index, true)}
            onClick={() =>
              addNewItem(type, data, gameName, selectedItem?.index, true, index)
            }
            onNewItemAdding={onNewItemAdding}
            moveCard={moveCard}
            style={{
              display: "flex",
              margin: "10px",
            }}
            // StyledCard={StyledCards[item.type]}
            gameName={gameName}
          >
            {/* {item.text} */}
            {data?.text}
          </HandCard>
        );
      }),
    [
      addNewItem,
      onNewItemAdding,
      selectedItem,
      handCards,
      moveCard,
      StyledCards,
    ]
  );

  return <div className="flex flex-wrap">{HandCards}</div>;
};

const Stage = ({
  items,
  setItems,
  addNewItem,
  isNewItemAdding,
  setSelectedItem,
  selectedItem,
}) => {
  const [stageItems, setStageItems] = useState(items);

  const [newAddingItemProps, setNewAddingItemProps] = useState({
    hoveredIndex: 0,
    shouldAddBelow: false,
  });

  const { hoveredIndex, shouldAddBelow } = newAddingItemProps;

  const handleNewAddingItemPropsChange = useCallback(
    (updatedProps) => {
      setNewAddingItemProps({
        ...newAddingItemProps,
        ...updatedProps,
      });
    },
    [setNewAddingItemProps]
  );

  useEffect(() => {
    if (!isEqual(stageItems, items)) {
      setStageItems(items.filter((item) => item !== undefined));
    }
  }, [items, stageItems]);
  //   }, [items]);

  const moveItem = useCallback(
    (dragIndex, hoverIndex) => {
      const dragItem = stageItems[dragIndex];
      //   setStageItems(
      setItems(
        update(stageItems, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragItem],
          ],
        })
      );
    },
    [stageItems, setStageItems]
  );

  const memoItems = useMemo(() => {
    return stageItems?.map((item, index) => {
      if (!item) return; //check
      const { id, type, data, gameName } = item;
      if (!type) return; //check
      return (
        <StageItem
          //   key={`id_${index}`}
          //   key={id}
          key={index}
          index={index}
          type={type}
          //   text={text}
          data={data}
          id={id}
          moveItem={moveItem}
          isNewItemAdding={isNewItemAdding}
          onNewAddingItemProps={handleNewAddingItemPropsChange}
          onClick={() => setSelectedItem({ id: id, index: index })}
          isSelected={!!id && id === selectedItem?.id}
          gameName={gameName}
        />
      );
    });
  }, [
    stageItems,
    moveItem,
    selectedItem,
    setSelectedItem,
    isNewItemAdding,
    handleNewAddingItemPropsChange,
  ]);

  const [{ isOver, draggingItemType }, dropRef] = useDrop({
    // accept: Object.keys(ITEM_TYPES),
    accept: ITEM_TYPES,
    drop: (droppedItem) => {
      const { id, type, data, gameName, index } = droppedItem;
      if (!id) {
        addNewItem(type, data, gameName, hoveredIndex, shouldAddBelow, index);
      } else {
        setItems(stageItems);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      draggingItemType: monitor.getItemType(),
    }),
  });

  useEffect(() => {
    if (isNewItemAdding) {
      //   const _stageItems = stageItems.filter(({ id }) => !!id);
      const _stageItems = stageItems.filter((item) => item && item.id);
      const startIndex = shouldAddBelow ? hoveredIndex + 1 : hoveredIndex;
      if (isOver && isNewItemAdding) {
        setStageItems([
          ..._stageItems.slice(0, startIndex),
          {
            type: draggingItemType,
          },
          ..._stageItems.slice(startIndex),
        ]);
      } else {
        setStageItems(_stageItems);
      }
    }
  }, [isOver, draggingItemType, isNewItemAdding, shouldAddBelow, hoveredIndex]);

  return (
    <div
      ref={dropRef}
      style={{
        width: "400px",
        height: "auto",
        overflowY: "auto",
        padding: "10px",
        border: "1px solid silver",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {memoItems}
    </div>
  );
};

const DND = ({
  items,
  setItems,
  setGamerItems,
  oneShot = true,
  newHCs,
  setNewHCs,
  maxStageCards,
  isLocked,
  checkIsAllowed,
  onNewItems,
  newHand,
  setNewHand,
}) => {
  const [handItems, setHandItems] = useState([]);

  const [isNewItemAdding, setNewItemAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const handleAddNewItem = useCallback(
    (
      type,
      data,
      gameName,
      hoveredIndex = items.length,
      shouldAddBelow = true,
      dragIndex
    ) => {
      if (
        isLocked ||
        !checkIsAllowed({ itemType: type, itemData: data, handItems }) ||
        !items //check
      )
        return;
      const startIndex = shouldAddBelow ? hoveredIndex + 1 : hoveredIndex;

      const maxId = items.reduce(
        (max, obj) => (obj.id > max ? obj.id : max),
        0
      );
      let newItems = [
        ...items.slice(0, startIndex),
        // { id: items.length + 1, type: type, text },
        // { id: maxId + 1, type: type, text },
        { id: maxId + 1, type: type, data, gameName },
        ...items.slice(startIndex),
      ];
      if (maxStageCards) {
        newItems = newItems.sort((a, b) => b.id - a.id).slice(0, maxStageCards);
      }

      setItems(newItems);
      onNewItems(newItems);

      setSelectedItem({
        // id: items.length + 1,
        // id: newItems.length + 1,
        id: maxId + 1,
        index: startIndex,
      });

      oneShot &&
        setHandItems((prevHandItems) =>
          prevHandItems.filter((_, index) => index !== dragIndex)
        );
    },
    [items, onNewItems]
  );

  const MemoHand = useCallback(() => {
    let HI;
    if (newHand) {
      HI = [];
    } else {
      HI = handItems;
    }
    if (newHCs) {
      HI = [...HI, ...newHCs];
    }

    // if (newHCs) {
    //   HI = [...handItems, ...newHCs];
    // } else {
    //   HI = handItems;
    // }

    return (
      <Hand
        addNewItem={handleAddNewItem}
        onNewItemAdding={setNewItemAdding}
        selectedItem={selectedItem}
        // gamerItems={gamerItems}
        // gamerItems={handItems}
        gamerItems={HI}
        setHandItems={setHandItems}
        // StyledCards={StyledCards}
        // gameName={gameName}
      />
    );
  }, [handleAddNewItem, selectedItem, newHCs]);

  useEffect(() => {
    // if (MemoHand) setNewHCs(null);
    if (MemoHand) {
      setNewHCs(null);
      setNewHand(null);
      setGamerItems(handItems);
    }
  }, [MemoHand]);

  return (
    <div style={{ display: "flex flex-col", justifyContent: "space-around" }}>
      <Stage
        items={items}
        setItems={setItems}
        addNewItem={handleAddNewItem}
        isNewItemAdding={isNewItemAdding}
        // onNewItemAdding={setNewItemAdding}
        setSelectedItem={setSelectedItem}
        selectedItem={selectedItem}
        // StyledCards={StyledCards}
      />
      <MemoHand />
    </div>
  );
};

export default function Uno({ roomId, roomToken, user, gameData }) {
  const [items, setItems] = useState([]);

  const [gamerItems, setGamerItems] = useState([]);
  const [newHCs, setNewHCs] = useState(null);
  console.log("gamerItems uno", gamerItems);
  console.log("items", items);
  console.log("gameData", gameData);
  const { gamers, phase, mustDraw, hasFreelyDrawn, unoPlayerName, counts } =
    gameData;
  const isAdmin = gameData.admin === user.name;

  const [toDraw, setToDraw] = useState(0);

  const [isLocked, setIsLocked] = useState(false);

  const [choosingColor, setChoosingColor] = useState(false);

  const isActive = gameData.activePlayer?.id === user.id;

  const [isUno, setIsUno] = useState(false);
  const [availableCounter, setAvailableCounter] = useState(false);
  const [counterTimeout, setCounterTimeout] = useState(null);

  const [newHand, setNewHand] = useState(null);

  useEffect(() => {
    gameData.phase === "start" && setNewHCs(gameData.startedCards[user.name]);
  }, [gameData.phase]);

  useEffect(() => {
    setItems([{ id: 0, ...gameData.card }]);
    setIsLocked(!isActive || mustDraw);
    setToDraw(gameData.toDraw);
  }, [gameData.card, gameData.activePlayer]);

  const checkIsAllowed = ({
    itemType: newItemType,
    itemData: newItemData,
    handItems,
  }) => {
    if (!items[0]) return false;
    const { type: currItemType, data: currItemData } = items[0];
    const { color: currItemColor, text: currItemText } = currItemData;
    const { color: newItemColor, text: newItemText } = newItemData;

    if (phase === "start" && currItemColor === "custom") return true;

    const differentColor = newItemColor !== currItemColor;
    const differentText = newItemText !== currItemText;

    switch (newItemType) {
      case "number":
        if (differentColor && differentText) return false;
        break;
      case "+2":
        if (differentColor && differentText) return false;
        break;
      case "reverse":
        if (differentColor && differentText) return false;
        break;
      case "skip":
        if (differentColor && differentText) return false;
        break;
      case "joker":
        //always possible
        break;
      case "+4":
        for (let handItem of handItems) {
          const { data } = handItem;
          if (data.color === currItemColor || data.text === currItemText) {
            return false;
          }
        }
        break;
      default:
    }
    return true;
  };

  const onNewCard = async (card) => {
    if (card[0].data.color === "custom") {
      setIsLocked(true);
      setChoosingColor(true);
    } else {
      let unoPlayerName;
      if (gamerItems.length === 2) unoPlayerName = user.name;

      await playCard({ card, gameData, roomToken, unoPlayerName });
    }
  };

  const chooseColor = async (color) => {
    const dataSpecial = items[0].data;
    const coloredSpecial = [{ ...items[0], data: { ...dataSpecial, color } }];
    setChoosingColor(false);

    let unoPlayerName;
    if (gamerItems.length === 1) unoPlayerName = user.name;

    await playCard({
      card: coloredSpecial,
      gameData,
      roomToken,
      unoPlayerName,
    });
  };

  useEffect(() => {
    if (phase === "uno") {
      if (unoPlayerName === user.name) {
        setIsUno(true);
      } else {
        setCounterTimeout(
          setTimeout(() => {
            setAvailableCounter(true);
          }, 3000)
        );
        setIsUno(false);
      }
    } else {
      setIsUno(false);
      clearTimeout(counterTimeout);
      setCounterTimeout(null);
      setAvailableCounter(false);
    }
    return () => {
      clearTimeout(counterTimeout);
    };
  }, [phase]);

  useEffect(() => {
    if (gamerItems.length === 0 && phase !== "start") {
      goEnd({ roomToken, gameData });
    }
  }, [gamerItems]);

  useEffect(() => {
    if (phase === "ended") {
      let count = 0;
      gamerItems.forEach((item) => {
        if (item.type === "number") count += parseInt(item.data.text);
        else if (item.type === "+4") count += 50;
        else count += 20;
      });
      addCount({ user, count });
      setNewHand([]);
    }
  }, [phase]);

  return (
    <>
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <Preview>{generatePreview}</Preview>
        <DND
          items={items}
          setItems={setItems}
          setGamerItems={setGamerItems}
          oneShot={true}
          newHCs={newHCs}
          setNewHCs={setNewHCs}
          maxStageCards={1}
          gameName="uno"
          isLocked={isLocked}
          checkIsAllowed={checkIsAllowed}
          onNewItems={onNewCard}
          newHand={newHand}
          setNewHand={setNewHand}
        />

        {isActive && (
          <>
            {!!toDraw && (
              <div>
                Vous devez piocher {toDraw} carte{toDraw >= 2 ? "s" : ""}
              </div>
            )}
            {!hasFreelyDrawn && (
              <button
                onClick={async () => {
                  if (hasFreelyDrawn) return;
                  const newCard = await drawCard({ roomToken, gameData });
                  setNewHCs([
                    {
                      ...newCard,
                      id: 0,
                    },
                  ]);
                }}
                className="p-2 border border-blue-300 bg-blue-100"
              >
                Piocher
              </button>
            )}
            {hasFreelyDrawn && (
              <button
                onClick={() => skipTurn({ roomToken, gameData })}
                className="p-2 border border-blue-300 bg-blue-100"
              >
                Passer votre tour
              </button>
            )}
          </>
        )}

        {choosingColor && (
          <div className="flex justify-around">
            <div
              onClick={() => chooseColor("red")}
              className="border-2 border-red-300 p-2"
            >
              Rouge
            </div>
            <div
              onClick={() => chooseColor("green")}
              className="border-2 border-green-300 p-2"
            >
              Vert
            </div>
            <div
              onClick={() => chooseColor("yellow")}
              className="border-2 border-yellow-300 p-2"
            >
              Jaune
            </div>
            <div
              onClick={() => chooseColor("blue")}
              className="border-2 border-blue-300 p-2"
            >
              Bleu
            </div>
          </div>
        )}

        {!isLocked && <div className="flex justify-center">C'est à vous !</div>}
        <div className="flex flex-wrap w-full justify-around">
          {gamers?.map((gamer, i) => (
            <div
              key={i}
              className={`${
                gameData.activePlayer?.name === gamer.name
                  ? "border-2 border-slate-300"
                  : ""
              }`}
            >
              {gamer.name}
            </div>
          ))}
        </div>

        {phase === "uno" && (
          <>
            {isUno && (
              <div
                onClick={() => untriggerUnoPhase({ roomToken, gameData })}
                className="border border-blue-300 bg-blue-100"
              >
                Uno !
              </div>
            )}
            {availableCounter && (
              <div
                onClick={() => triggerUnoFail({ roomToken, gameData })}
                className="border border-blue-300 bg-blue-100"
              >
                Contre Uno !
              </div>
            )}
          </>
        )}

        {phase === "ended" && counts && (
          <div>
            {Object.entries(counts).map((count, i) => (
              <div key={i}>
                {count[0]} : {count[1]} point{count[1] >= 2 ? "s" : ""}
              </div>
            ))}
          </div>
        )}
      </DndProvider>

      {isAdmin ? (
        !gameData.ended ? (
          <FinishGame gameData={gameData} roomToken={roomToken} />
        ) : (
          <>
            <div
              onClick={() => goNewUnoGame({ roomToken, gameData })}
              className="border border-blue-300 bg-blue-100"
            >
              Nouvelle manche
            </div>
            <ChooseOneMoreGame gameData={gameData} roomToken={roomToken} />
          </>
        )
      ) : gameData.ended ? (
        <EndGame gameData={gameData} user={user} />
      ) : null}
    </>
  );
}
