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

// const ITEM_TYPES = {
//   FEU: "FEU",
//   TERRE: "TERRE",
//   AIR: "AIR",
//   EAU: "EAU",
//   METAL: "METAL",
//   BOIS: "BOIS",
// };

const ITEM_TYPES = ["number", "+2", "reverse", "skip", "joker", "+4"];

// const data = [
//   {
//     type: "FEU",
//     text: "C'est du feu",
//   },
//   {
//     type: "TERRE",
//     text: "C'est de la terre",
//   },
//   {
//     type: "AIR",
//     text: "C'est de l'air",
//   },
//   {
//     type: "EAU",
//     text: "C'est de l'eau",
//   },
//   {
//     type: "METAL",
//     text: "C'est du métal",
//   },
//   {
//     type: "BOIS",
//     text: "C'est du bois",
//   },
// ];

const data = [
  {
    gameName: "uno",
    type: "number",
    data: {
      color: "red",
      text: "0",
    },
  },
  {
    gameName: "uno",
    type: "number",
    data: {
      color: "blue",
      text: "1",
    },
  },
  {
    gameName: "uno",
    type: "number",
    data: {
      color: "yellow",
      text: "1",
    },
  },
  {
    gameName: "uno",
    type: "number",
    data: {
      color: "green",
      text: "2",
    },
  },
  {
    gameName: "uno",
    type: "joker",
    data: {
      color: "custom",
      text: "",
    },
  },
];

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
  //   text,
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
      console.log("itemRef", itemRef);
      console.log("item lààààà", item);

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

  if (!gameName) return;
  return (
    <div>
      {StyledCards[gameName][type]({
        //   {StyledCard({
        handlerId: handlerId,
        ref: itemRef,
        // index,
        onClick,
        data,
      })}
    </div>
  );
};

const generatePreview = (props) => {
  console.log("generatePreview props", props);
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
  //   text,
  data,
  onClick,
  onNewItemAdding,
  moveCard,
  //   StyledCard,
  gameName,
}) => {
  const cardRef = useRef(null);

  console.log("data là", data);

  const [collected, drop] = useDrop({
    // accept: Object.keys(ITEM_TYPES),
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
  //   console.log("handlerId", handlerId);
  console.log("collected", collected);

  const [{ isDragging }, dragRef] = useDrag({
    type: itemType,
    // item: { type: itemType, text, index },
    item: { type: itemType, data, gameName, index },
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
    <div>
      {StyledCards[gameName][itemType]({
        ref: cardRef,
        index,
        handlerId: collected.handlerId,
        onClick,
        data,
      })}
      {/* {StyledCard({
        ref: cardRef,
        index,
        handlerId: collected.handlerId,
        onClick,
        data,
      })} */}
    </div>
  );

  return (
    <div
      //   ref={dragRef}
      ref={cardRef}
      index={index}
      data-handler-id={collected.handlerId}
      type="button"
      onClick={onClick}
      style={{
        ...data.style,
        width: "50px",
        height: "50px",
        padding: "20px",
        margin: "10px",
      }}
    >
      {/* <div>{itemType}</div> */}
      {/* <div>{text}</div> */}
      <div>{data?.text}</div>
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
              //   addNewItem(item.type, item.text, selectedItem?.index, true, index)
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
            {data.text}
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
  console.log("Object.values(gamerItems)", Object.values(gamerItems));
  return <div className="flex">{HandCards}</div>;
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
      const { id, type, data, gameName } = item;

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
      console.log("droppedItem iciii", droppedItem);
      if (!id) {
        addNewItem(type, data, gameName, hoveredIndex, shouldAddBelow, index);
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
  gamerItems,
  oneShot = true,
  newHC,
  setNewHC,
  maxStageCards,
  //   StyledCards,
}) => {
  //   const [items, setItems] = useState([]);
  const [handItems, setHandItems] = useState(gamerItems);

  const [isNewItemAdding, setNewItemAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const handleAddNewItem = useCallback(
    (
      type,
      //   text,
      data,
      gameName,
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
        // { id: maxId + 1, type: type, text },
        { id: maxId + 1, type: type, data, gameName },
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
        // StyledCards={StyledCards}
        // gameName={gameName}
      />
    );
  }, [handleAddNewItem, selectedItem, newHC]);

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

  const [gamerItems, setGamerItems] = useState(data);
  const [newHC, setNewHC] = useState(null);
  console.log("gamerItems", gamerItems);
  return (
    <>
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <Preview>{generatePreview}</Preview>
        <DND
          items={items}
          setItems={setItems}
          gamerItems={gamerItems}
          //   setGamerItems={setGamerItems}
          oneShot={true}
          newHC={newHC}
          setNewHC={setNewHC}
          maxStageCards={1}
          //   StyledCards={UnoStyledCards}
          gameName="uno"
        />
        <button onClick={() => setNewHC({ type: "EAU", text: "youpilala" })}>
          svzsef
        </button>
        <button onClick={() => setItems([])}>reset</button>
      </DndProvider>
    </>
  );
}
