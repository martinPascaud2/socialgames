import { finishGame } from "@/categories/[categorie]/(games)/actionouverite/actions";

export default function FinishGame({ gameData, roomToken }) {
  return (
    <div
      onClick={() => finishGame({ gameData, roomToken })}
      className="border border-blue-300 bg-blue-100"
    >
      Terminer le jeu
    </div>
  );
}
