"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

import {
  MultiBackend,
  TouchTransition,
  MouseTransition,
} from "react-dnd-multi-backend";

import update from "immutability-helper";
import isEqual from "lodash.isequal";

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

const ItemTypes = {
  CARD: "card",
};

const style = {
  border: "1px dashed gray",
  padding: "0.5rem 1rem",
  marginBottom: ".5rem",
  backgroundColor: "white",
  cursor: "move",
};
const Card = ({
  id,
  text,
  effect,
  index,
  moveCard,
  setNewItemAdding,
  setSelectedItem,
}) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveCard(dragIndex, hoverIndex);

      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  useEffect(() => {
    setNewItemAdding(isDragging);
    setSelectedItem({ id, index });
  }, [isDragging, setNewItemAdding]);

  drag(drop(ref));
  return (
    <div
      ref={ref}
      style={{ ...style, opacity }}
      data-handler-id={handlerId}
      //   onClick={() => setSelectedItem({ id, index })}

      //   onDragStart={() => setSelectedItem({ id, index })}
    >
      {text} effect:{effect}
    </div>
  );
};

const Container = ({ items, setNewItemAdding, setSelectedItem }) => {
  {
    const [cards, setCards] = useState(items);
    const moveCard = useCallback((dragIndex, hoverIndex) => {
      setCards((prevCards) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        })
      );
    }, []);
    const renderCard = useCallback(
      (card, index) => {
        return (
          <Card
            key={card.id}
            index={index}
            id={card.id}
            text={card.text}
            effect={card.effect}
            moveCard={moveCard}
            setNewItemAdding={setNewItemAdding}
            setSelectedItem={setSelectedItem}
          />
        );
      },
      [moveCard, setNewItemAdding, setSelectedItem]
    );
    return (
      <>
        <div style={style}>{cards.map((card, i) => renderCard(card, i))}</div>
      </>
    );
  }
};

const Stage = ({ items, setNewItemAdding, setSelectedItem }) => {
  {
    const [cards, setCards] = useState(items);
    const moveCard = useCallback((dragIndex, hoverIndex) => {
      setCards((prevCards) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        })
      );
    }, []);
    const renderCard = useCallback(
      (card, index) => {
        return (
          <Card
            key={card.id}
            index={index}
            id={card.id}
            text={card.text}
            effect={card.effect}
            moveCard={moveCard}
            setNewItemAdding={setNewItemAdding}
            setSelectedItem={setSelectedItem}
          />
        );
      },
      [moveCard]
    );
    return (
      <>
        <div style={style}>{cards?.map((card, i) => renderCard(card, i))}</div>
      </>
    );
  }
};

const items = [
  {
    id: 1,
    text: "Write a cool JS library",
    effect: "sdcsdc",
  },
  {
    id: 2,
    text: "Make it generic enough",
    effect: "sdcsdc",
  },
  {
    id: 3,
    text: "Write README",
    effect: "sdcsdc",
  },
  {
    id: 4,
    text: "Create some examples",
    effect: "sdcsdc",
  },
  {
    id: 5,
    text: "Spam in Twitter and IRC to promote it (note that this element is taller than the others)",
    effect: "sdcsdc",
  },
  {
    id: 6,
    text: "???",
    effect: "sdcsdc",
  },
  {
    id: 7,
    text: "PROFIT",
    effect: "sdcsdc",
  },
];

export default function Uno({ roomId, roomToken, user, gameData }) {
  const [handItems, setHandItems] = useState(items);
  const [stageItems, setStageItems] = useState(items);

  const [isNewItemAdding, setNewItemAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState({});

  console.log("isNewItemAdding", isNewItemAdding);
  console.log("selectedItem", selectedItem);

  return (
    <>
      <DndProvider backend={TouchBackend} options={HTML5toTouch}>
        <Container
          items={handItems}
          setNewItemAdding={setNewItemAdding}
          setSelectedItem={setSelectedItem}
        />
        <Stage
          items={stageItems}
          setStageItems={setStageItems}
          setNewItemAdding={setNewItemAdding}
          setSelectedItem={setSelectedItem}
        />
      </DndProvider>
    </>
  );
}
