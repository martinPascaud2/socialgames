import { useRouter } from "next/navigation";

export default function EndGame({ gameData, user, isFirst = false }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center">
      {!isFirst && <div>Fin du jeu !</div>}
      {isFirst && <div>Recherche de la prochaine partie...</div>}

      {gameData?.nextGame && (
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
      )}
      {gameData.admin !== user.name && (
        <button
          onClick={() => router.push("/")}
          className="border border-blue-300 bg-blue-100"
        >
          Quitter le groupe
        </button>
      )}
    </div>
  );
}
