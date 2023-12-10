import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import Categories from "./Categories";

export default async function CategoriesPage() {
  const signOut = async () => {
    "use server";
    cookies().delete("SG_token");
    redirect("/");
  };
  return <Categories signOut={signOut} />;
}
