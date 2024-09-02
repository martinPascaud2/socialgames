"use client";

import { useRouter } from "next/navigation";

import deleteGroup from "@/utils/deleteGroup";
import { deleteRoom } from "./Room/actions";

export default function DeleteGroup({ roomToken, roomId }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await deleteGroup({ groupToken: roomToken });
        await deleteRoom({ roomId });
        window.location.href = "/categories?control=true";
      }}
      className="border border-blue-300 bg-blue-100"
    >
      Quitter
    </button>
  );
}
