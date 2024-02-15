"use server";

import * as jose from "jose";
import { cookies } from "next/headers";

export async function setCookieToken(status, mail) {
  const secret = new TextEncoder().encode(process.env.PRIVATE_KEY);
  const alg = "HS256";

  const jwt = await new jose.SignJWT({
    [process.env.NEXT_PUBLIC_APP_URL]: true,
    mail,
  })
    .setProtectedHeader({ alg })
    .setSubject(status)
    .sign(secret);

  cookies().set({
    name: "SG_token",
    value: jwt,
    httpOnly: true,
    path: "/",
  });
}

export async function setPrevCookie({ mail, password }) {
  const secret = new TextEncoder().encode(process.env.PRIVATE_KEY);
  const alg = "HS256";

  const jwt = await new jose.SignJWT({
    [process.env.NEXT_PUBLIC_APP_URL]: true,
    mail,
    password,
  })
    .setProtectedHeader({ alg })
    .setSubject("previous")
    .sign(secret);

  cookies().set({
    name: "SG_prev",
    value: jwt,
    httpOnly: true,
    path: "/",
  });
}
