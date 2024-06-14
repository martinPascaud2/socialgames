import { useRouter } from "next/navigation";

export default function EndGame({ gameData, user, isFirst = false }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center">
      {isFirst && <div>Recherche de la prochaine partie...</div>}

      {gameData?.nextGame ? (
        <>
          <button
            onClick={() => {
              router.push(
                `${gameData.nextGame.path}${
                  user.multiGuest ? `&guestName=${user.name}` : ""
                }`
              );
            }}
            className="border border-blue-300 bg-blue-100 m-1"
          >
            Retour au lobby
          </button>
        </>
      ) : (
        <div className="text-white m-1">En attente de l&apos;admin...</div>
      )}
      {gameData.admin !== user.name && (
        <button
          onClick={() => router.push("/categories?control=true")}
          className="border border-blue-300 bg-blue-100 m-1"
        >
          Quitter le groupe
        </button>
      )}
    </div>
  );
}
