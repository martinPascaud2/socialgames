"use client";

import { useRouter, useSearchParams } from "next/navigation";

import deleteGroup from "@/utils/deleteGroup";

export default function DeleteGroup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGroup = searchParams.get("group") === "true";

  return (
    <>
      {isGroup && (
        <div className="z-20 absolute bottom-0 w-full p-2 border-t border-blue-300 bg-blue-100 flex">
          <button
            onClick={() => {
              const groupToken = JSON.parse(
                localStorage.getItem("group")
              ).roomToken;
              deleteGroup({ groupToken });
              localStorage.removeItem("group");
              router.push("/");
            }}
            className="border border-blue-300 bg-white m-auto p-1 text-blue-300"
          >
            Supprimer le groupe
          </button>
        </div>
      )}
    </>
  );
}
