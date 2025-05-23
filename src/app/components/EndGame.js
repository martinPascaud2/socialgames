import { useRouter } from "next/navigation";

import cancelBack from "@/utils/cancelBack";
import {
  removeArrival,
  serverDeleteGamer,
  serverDeleteMultiGuest,
} from "./Room/actions";

export default function EndGame({ gameData, user, isFirst = false }) {
  const router = useRouter();

  return (
    <div className={`flex items-center justify-center`}>
      {isFirst && <div>Recherche de la prochaine partie...</div>}

      {!isFirst && !gameData?.nextGame && (
        <div className="text-white">En attente de l&apos;admin...</div>
      )}

      {gameData?.nextGame && !isFirst && (
        <>
          <button
            onClick={() => {
              const path = `${gameData.nextGame.path}${
                user.multiGuest ? `&guestName=${user.name}` : ""
              }`;
              router.push(`/categories/back/backToLobby/?path=${path}`);
            }}
            className="border border-blue-300 bg-blue-100"
          >
            Retour au lobby
          </button>
        </>
      )}

      {gameData?.postgameRef && !user.multiGuest && (
        <>
          <button
            onClick={() => {
              router.push(`${gameData.postgameRef}`);
            }}
            className="border border-blue-300 bg-blue-100"
          >
            Post game
          </button>
        </>
      )}

      {gameData.admin !== user.name && (
        <button
          onClick={async () => {
            await cancelBack({ userId: user.id });

            if (gameData?.nextGame) {
              await removeArrival({
                roomId: gameData.nextGame.roomId,
                deletedGamer: user.name,
              });
              const token = gameData.nextGame.path.split("token=")[1];
              if (!user.multiGuest)
                await serverDeleteGamer({ token, gamerName: user.name });
              else
                await serverDeleteMultiGuest({
                  token,
                  multiGuestName: user.name,
                });
            }

            window.location.href = "/categories";
          }}
          className="border border-blue-300 bg-blue-100"
        >
          Quitter le groupe
        </button>
      )}
    </div>
  );
}
