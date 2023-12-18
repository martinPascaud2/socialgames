import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    </>
  );
}
