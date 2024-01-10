"use client";

import { useRouter } from "next/navigation";

export default function GuestLink({ setCookieToken }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await setCookieToken("Guest", "guest");
        router.push("/guest");
      }}
      className="border border-blue-300 bg-blue-100"
    >
      Connexion guest
    </button>
  );
}
