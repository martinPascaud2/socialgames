"use client";

import Link from "next/link";

export default function LogOut({ signOut }) {
  return (
    <Link
      href="/"
      onClick={() => signOut()}
      className="absolute w-1/3 p-3 text-center border"
    >
      Déconnexion
    </Link>
  );
}
