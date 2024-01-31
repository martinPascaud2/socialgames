import { useRouter } from "next/navigation";

export default function EndGame() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center">
      <div>Sélection du jeu...</div>
      <button
        onClick={() => router.push("/")}
        className="border border-blue-300 bg-blue-100"
      >
        Quitter le groupe
      </button>
    </div>
  );
}
