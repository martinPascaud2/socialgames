"use client";

import Link from "next/link";

export default function LogOut({ signOut }) {
  return (
    <Link
      href="/"
      onClick={() => signOut()}
      className="w-1/3 text-center border"
    >
      Déconnexion
    </Link>
  );
}
