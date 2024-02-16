"use client";

import { useRouter } from "next/navigation";

import deleteGroup from "@/utils/deleteGroup";

export default function DeleteGroup({ roomToken }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        deleteGroup({ groupToken: roomToken });
        router.push("/categories?control=true");
      }}
      className="border border-blue-300 bg-blue-100"
    >
      Supprimer le groupe
    </button>
  );
}
