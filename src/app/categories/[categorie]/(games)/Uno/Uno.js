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

const ITEM_TYPES = {
  FEU: "FEU",
  TERRE: "TERRE",
  AIR: "AIR",
  EAU: "EAU",
  METAL: "METAL",
  BOIS: "BOIS",
};

const data = [
  {
    type: "FEU",
    text: "C'est du feu",
  },
  {
    type: "TERRE",
    text: "C'est de la terre",
  },
  {
    type: "AIR",
    text: "C'est de l'air",
  },
  {
    type: "EAU",
    text: "C'est de l'eau",
  },
  {
    type: "METAL",
    text: "C'est du métal",
  },
  {
    type: "BOIS",
    text: "C'est du bois",
  },
];

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
  text,
  moveItem,
  isNewItemAdding,
  onNewAddingItemProps,
  onClick,
  isSelected,
}) => {
  const itemRef = useRef(null);

  const [{ handlerId }, drop] = useDrop({
    accept: Object.keys(ITEM_TYPES),
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      console.log("itemRef", itemRef);
      console.log("item", item);

      if (!itemRef.current && !itemRef.current?.getBoundingClientRect) {
        return;
      }

      const { top, bottom, height } = itemRef.current.getBoundingClientRect();
      const { y } = monitor.getClientOffset();
      const hoverIndex = index;
      const dragIndex = item.index;

      const hoverMiddleY = (bottom - top) / 2;
      const hoverClientY = y - top;

      //   console.log("id", id);
      //   console.log("dragIndex", dragIndex);
      //   console.log("hoverIndex", hoverIndex);
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
        // console.log(
        //   "passé là",
        //   "hoverIndex",
        //   hoverIndex,
        //   "dragIndex",
        //   dragIndex
        // );
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
    // item: { type: type, id, index },
    item: { type: type, id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  console.log("isDragging", isDragging);
  console.log("id", id, typeof id);

  drag(drop(itemRef));

  const opacity = isNewItemAdding && !id ? "0.3" : "1";
  const border = isSelected ? "3px dashed blue" : "1px solid silver";
  return (
    <div
      data-handler-id={handlerId}
      ref={itemRef}
      style={{
        padding: "10px",
        margin: "10px",
        opacity,
        border,
      }}
      onClick={onClick}
    >
      {type}
      {text}
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
  text,
  onClick,
  onNewItemAdding,
  moveCard,
}) => {
  const cardRef = useRef(null);

  const [collected, drop] = useDrop({
    accept: Object.keys(ITEM_TYPES),
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
  //   console.log("handlerId", handlerId);
  console.log("collected", collected);

  const [{ isDragging }, dragRef] = useDrag({
    type: itemType,
    item: { type: itemType, text, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    onNewItemAdding(isDragging);
  }, [isDragging, onNewItemAdding]);

  dragRef(drop(cardRef));

  console.log("isDragging", isDragging);

  return (
    <div
      //   ref={dragRef}
      ref={cardRef}
      index={index}
      data-handler-id={collected.handlerId}
      type="button"
      onClick={onClick}
      style={{
        background: "blue",
        color: "#fff",
        padding: "20px",
        margin: "10px",
        border: "none",
      }}
    >
      <div>{itemType}</div>
      <div>{text}</div>
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
      console.log("222 dragIndex", dragIndex);
      console.log("222 hoverIndex", hoverIndex);
      const dragItem = handCards[dragIndex];
      //   setStageItems(
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
      //   Object.keys(ITEM_TYPES).map((itemType) => {

      //   Object.values(gamerItems).map((item, index) => {
      handCards.map((item, index) => {
        return (
          <HandCard
            // key={itemType}
            index={index}
            // key={item.type}
            key={index}
            type="button"
            itemType={item.type}
            text={item.text}
            // onClick={() => addNewItem(itemType, selectedItem?.index, true)}
            onClick={() =>
              addNewItem(item.type, item.text, selectedItem?.index, true, index)
            }
            onNewItemAdding={onNewItemAdding}
            moveCard={moveCard}
            style={{
              display: "flex",
              margin: "10px",
            }}
          >
            {item.text}
          </HandCard>
        );
      }),
    [addNewItem, onNewItemAdding, selectedItem, handCards, moveCard]
  );
  console.log("Object.values(gamerItems)", Object.values(gamerItems));
  return <div>{HandCards}</div>;
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

  console.log("items", items);
  console.log("stageItems", stageItems);

  const [newAddingItemProps, setNewAddingItemProps] = useState({
    hoveredIndex: 0,
    shouldAddBelow: false,
  });

  const { hoveredIndex, shouldAddBelow } = newAddingItemProps;

  const handleNewAddingItemPropsChange = useCallback(
    (updatedProps) => {
      console.log("updatedProps", updatedProps);
      setNewAddingItemProps({
        ...newAddingItemProps,
        ...updatedProps,
      });
    },
    [setNewAddingItemProps]
  );

  useEffect(() => {
    if (!isEqual(stageItems, items)) {
      setStageItems(items);
    }
  }, [items, stageItems]);
  //   }, [items]);

  const moveItem = useCallback(
    (dragIndex, hoverIndex) => {
      console.log("dragIndex", dragIndex);
      console.log("hoverIndex", hoverIndex);
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
      const { id, type, text } = item;
      return (
        <StageItem
          //   key={`id_${index}`}
          //   key={id}
          key={index}
          index={index}
          type={type}
          text={text}
          id={id}
          moveItem={moveItem}
          isNewItemAdding={isNewItemAdding}
          onNewAddingItemProps={handleNewAddingItemPropsChange}
          onClick={() => setSelectedItem({ id: id, index: index })}
          isSelected={!!id && id === selectedItem?.id}
        />
      );
    });
  }, [
    stageItems,
    moveItem,
    selectedItem,
    isNewItemAdding,
    handleNewAddingItemPropsChange,
  ]);

  const [{ isOver, draggingItemType }, dropRef] = useDrop({
    accept: Object.keys(ITEM_TYPES),
    drop: (droppedItem) => {
      const { id, type, text, index } = droppedItem;
      if (!id) {
        addNewItem(type, text, hoveredIndex, shouldAddBelow, index);
      } else {
        setItems(stageItems);
      }
      //   console.log(
      //     "droppedItem: ",
      //     type,
      //     "order: ",
      //     hoveredIndex,
      //     isNewItemAdding ? "new item added!" : ""
      //   );
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      draggingItemType: monitor.getItemType(),
    }),
  });

  useEffect(() => {
    if (isNewItemAdding) {
      const _stageItems = stageItems.filter(({ id }) => !!id);
      const startIndex = shouldAddBelow ? hoveredIndex + 1 : hoveredIndex;
      console.log("startIndex", startIndex);
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
      }}
    >
      {memoItems}
    </div>
  );
};

const DND = ({
  gamerItems,
  oneShot = true,
  newHC,
  setNewHC,
  maxStageCards,
}) => {
  const [items, setItems] = useState([]);
  const [handItems, setHandItems] = useState(gamerItems);

  const [isNewItemAdding, setNewItemAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const handleAddNewItem = useCallback(
    (
      type,
      text,
      hoveredIndex = items.length,
      shouldAddBelow = true,
      dragIndex
    ) => {
      const startIndex = shouldAddBelow ? hoveredIndex + 1 : hoveredIndex;

      const maxId = items.reduce(
        (max, obj) => (obj.id > max ? obj.id : max),
        0
      );
      let newItems = [
        ...items.slice(0, startIndex),
        // { id: items.length + 1, type: type, text },
        { id: maxId + 1, type: type, text },
        ...items.slice(startIndex),
      ];
      if (maxStageCards) {
        newItems = newItems.sort((a, b) => b.id - a.id).slice(0, maxStageCards);
      }

      setItems(newItems);

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
    [items]
  );

  const MemoHand = useCallback(() => {
    let HI;
    if (newHC) {
      HI = [...handItems, newHC];
      setNewHC(null);
    } else {
      HI = handItems;
    }
    return (
      <Hand
        addNewItem={handleAddNewItem}
        onNewItemAdding={setNewItemAdding}
        selectedItem={selectedItem}
        // gamerItems={gamerItems}
        // gamerItems={handItems}
        gamerItems={HI}
        setHandItems={setHandItems}
      />
    );
  }, [handleAddNewItem, selectedItem, newHC]);

  return (
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      <MemoHand />
      <Stage
        items={items}
        setItems={setItems}
        addNewItem={handleAddNewItem}
        isNewItemAdding={isNewItemAdding}
        // onNewItemAdding={setNewItemAdding}
        setSelectedItem={setSelectedItem}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default function Uno({ roomId, roomToken, user, gameData }) {
  const [gamerItems, setGamerItems] = useState(data);
  const [newHC, setNewHC] = useState(null);
  console.log("gamerItems", gamerItems);
  return (
    <>
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <Preview>{generatePreview}</Preview>
        <DND
          gamerItems={gamerItems}
          //   setGamerItems={setGamerItems}
          oneShot={true}
          newHC={newHC}
          setNewHC={setNewHC}
          maxStageCards={1}
        />
        <button onClick={() => setNewHC({ type: "EAU", text: "youpilala" })}>
          svzsef
        </button>
      </DndProvider>
    </>
  );
}
