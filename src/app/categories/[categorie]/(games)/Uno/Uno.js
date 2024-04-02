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

const HandCard = ({ itemType, onClick, onNewItemAdding }) => {
  const [{ isDragging }, dragRef] = useDrag({
    type: itemType,
    item: { type: itemType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    onNewItemAdding(isDragging);
  }, [isDragging, onNewItemAdding]);

  console.log("isDragging", isDragging);

  return (
    <div ref={dragRef}>
      <div
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
        {itemType}
      </div>
    </div>
  );
};

const Hand = ({ addNewItem, onNewItemAdding, selectedItem }) => {
  const HandCards = useMemo(
    () =>
      Object.keys(ITEM_TYPES).map((itemType) => {
        return (
          <HandCard
            key={itemType}
            type="button"
            itemType={itemType}
            onClick={() => addNewItem(itemType, selectedItem?.index, true)}
            onNewItemAdding={onNewItemAdding}
            style={{
              display: "flex",
              margin: "10px",
            }}
          >
            {itemType}
          </HandCard>
        );
      }),
    [addNewItem, onNewItemAdding, selectedItem]
  );
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
      const { id, type } = item;
      return (
        <StageItem
          //   key={`id_${index}`}
          key={id}
          index={index}
          type={type}
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
      const { type, id } = droppedItem;
      if (!id) {
        // a new item added
        addNewItem(type, hoveredIndex, shouldAddBelow);
      } else {
        // the result of sorting is applying the mock data
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

const DND = () => {
  const [items, setItems] = useState([]);

  const [isNewItemAdding, setNewItemAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  const handleAddNewItem = useCallback(
    (type, hoveredIndex = items.length, shouldAddBelow = true) => {
      const startIndex = shouldAddBelow ? hoveredIndex + 1 : hoveredIndex;
      setItems([
        ...items.slice(0, startIndex),
        { id: items.length + 1, type: type },
        ...items.slice(startIndex),
      ]);

      setSelectedItem({
        id: items.length + 1,
        index: startIndex,
      });
    },
    [items]
  );

  const MemoHand = useCallback(
    () => (
      <Hand
        addNewItem={handleAddNewItem}
        onNewItemAdding={setNewItemAdding}
        selectedItem={selectedItem}
      />
    ),
    [handleAddNewItem, selectedItem]
  );

  return (
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      <MemoHand />
      <Stage
        items={items}
        setItems={setItems}
        addNewItem={handleAddNewItem}
        isNewItemAdding={isNewItemAdding}
        onNewItemAdding={setNewItemAdding}
        setSelectedItem={setSelectedItem}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default function Uno({ roomId, roomToken, user, gameData }) {
  return (
    <>
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <Preview>{generatePreview}</Preview>
        <DND />
      </DndProvider>
    </>
  );
}
