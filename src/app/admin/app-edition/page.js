import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import LogOut from "./LogOut";

export default function EditionPage() {
  const signOut = async () => {
    "use server";
    cookies().delete("SG_token");
    redirect("/");
  };
  return (
    <>
      <div>l'éditeur</div>
      <LogOut signOut={signOut} />
      <Link
        href="/admin/app-edition/actionouverite"
        className="w-1/3 text-center border"
      >
        Action ou Vérité
      </Link>
    </>
  );
}
