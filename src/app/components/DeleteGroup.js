"use client";

import { useRouter } from "next/navigation";
import { useUserContext } from "./Room/Room";

import deleteGroup from "@/utils/deleteGroup";
import { deleteRoom } from "./Room/actions";

export default function DeleteGroup({ roomToken, roomId }) {
  const router = useRouter();
  const contextValue = useUserContext();
  const userParams = contextValue.userParams;

  return (
    <button
      onClick={async () => {
        await deleteGroup({ groupToken: roomToken });
        await deleteRoom({ roomId });
        window.location.href = "/categories";
      }}
      className="border border-blue-300 bg-blue-100"
      style={{ bottom: `${userParams?.bottomBarSize / 4 || 2}rem` }}
    >
      Quitter
    </button>
  );
}
