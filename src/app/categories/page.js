import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { jwtVerify } from "@/utils/jwtVerify";
import Categories from "./Categories";

export default async function CategoriesPage() {
  const signOut = async () => {
    "use server";
    cookies().delete("SG_token");
    redirect("/");
  };
  const token = cookies().get("SG_token");

  //to be used
  const { userMail } = await jwtVerify(token);
  console.log("userMail", userMail);
  return <Categories signOut={signOut} />;
}
