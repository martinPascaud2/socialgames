import { useRouter } from "next/navigation";

import cancelBack from "@/utils/cancelBack";

export default function EndGame({ gameData, user, isFirst = false }) {
  const router = useRouter();

  return (
    <div
      className={`flex items-center justify-center`}
      style={{
        marginTop: `${
          user.params?.topBarSize && isFirst
            ? `${user.params.topBarSize / 4}`
            : 2
        }rem`,
      }}
    >
      {isFirst && <div>Recherche de la prochaine partie...</div>}

      {!isFirst && !gameData?.nextGame && (
        <div className="text-white">En attente de l&apos;admin...</div>
      )}

      {gameData?.nextGame && (
        <>
          <button
            onClick={() => {
              router.push(
                `${gameData.nextGame.path}${
                  user.multiGuest ? `&guestName=${user.name}` : ""
                }`
              );
            }}
            className="border border-blue-300 bg-blue-100"
          >
            Retour au lobby
          </button>
        </>
      )}

      {gameData.admin !== user.name && (
        <button
          onClick={async () => {
            await cancelBack({ userId: user.id });
            router.push("/categories?control=true");
          }}
          className="border border-blue-300 bg-blue-100"
        >
          Quitter le groupe
        </button>
      )}
    </div>
  );
}
