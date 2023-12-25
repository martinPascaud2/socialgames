"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { subCategories } from "@/assets/globals";

const useSwipe = (activeIndex, updateIndex) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      updateIndex(activeIndex + 1);
    }
    if (isRightSwipe) {
      updateIndex(activeIndex - 1);
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

export default function OneCategoriePage({ params }) {
  const { categorie } = params;
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const games = subCategories[categorie];

  const updateIndex = useCallback(
    (newIndex) => {
      console.log("newIndex", newIndex);
      if (newIndex < 0) {
        newIndex = games.length - 1;
      } else if (newIndex === games.length) {
        newIndex = 0;
      }
      setActiveIndex(newIndex);
    },
    [games.length]
  );

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe(
    activeIndex,
    updateIndex
  );

  const divNavs = [];
  for (let i = 0; i < 8; i++) {
    divNavs.push(
      <div
        key={i}
        onClick={() => setActiveIndex(i)}
        className={`w-8 h-4 ${
          i === activeIndex ? "bg-yellow-700" : "bg-yellow-300"
        }`}
      />
    );
  }

  return (
    <main className="bg-slate-300">
      <div className="p-5">
        <div className="w-full overflow-hidden mx-auto">
          <div
            className={"inner whitespace-nowrap duration-300"}
            style={{
              transform: `translateX(-${activeIndex * 100}%) translateZ(0)`,
            }}
          >
            {games.map((game) => (
              <div key={game.name} className="inline-flex">
                <Image
                  alt={`Image du jeu ${game.name}`}
                  src={game.img}
                  width={1800}
                  height={1125}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  onClick={() =>
                    router.push(`/categories/${categorie}/${game.path}`)
                  }
                  priority
                />
              </div>
            ))}
          </div>
        </div>
        <div>{games[activeIndex].name}</div>
        <div className="flex justify-between">{divNavs}</div>
      </div>
    </main>
  );
}
