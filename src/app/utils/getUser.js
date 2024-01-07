"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "./jwtVerify";
import prisma from "./prisma";

export default async function getUser() {
  const token = cookies().get("SG_token");
  const { userMail } = await jwtVerify(token);
  console.log("userMail getUser", userMail);
  const user = await prisma.user.findFirst({
    where: {
      email: userMail,
    },
  });
  console.log("user getUser", user);
  return user;
}
