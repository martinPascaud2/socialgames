import Image from "next/image";

import { searchGame } from "./actions";

export default function ChooseAnotherGame({
  gameName,
  categorieSrc,
  setShowPlayers,
  setShowConfig,
  gameData,
  roomId,
  roomToken,
  deleteInvs,
}) {
  return (
    <div
      onClick={async () => {
        await deleteInvs();
        await searchGame({ gameData, roomId, roomToken });

        setShowPlayers(true);
        setShowConfig(false);
      }}
    >
      {gameName !== "grouping" && (
        <Image
          src={categorieSrc}
          alt={`${gameName} categorie image`}
          className="absolute top-1/2 translate-y-[-50%] left-1/2 translate-x-[-50%] max-h-[4dvh] max-w-[4dvh] aspect-square opacity-50"
          style={{
            objectFit: "contain",
            pointerEvents: "none",
            filter:
              "invert(31%) sepia(61%) saturate(1242%) hue-rotate(357deg) brightness(103%) contrast(96%)", // amber-700
            zIndex: 0,
          }}
          width={500}
          height={500}
          priority
        />
      )}

      <span className="relative z-10">{gameName}</span>
    </div>
  );
}
