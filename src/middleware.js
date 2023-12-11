import { NextResponse } from "next/server";

import { jwtVerify } from "@/utils/jwtVerify";

export async function middleware(request) {
  //isolate the client's requested path
  if (request.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("SG_token");

  if (
    !token &&
    request.nextUrl.pathname !== "/" &&
    request.nextUrl.pathname !== "/signin"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    token &&
    (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/signin")
  ) {
    return NextResponse.redirect(new URL("/categories", request.url));
  }

  const { userStatus } = await jwtVerify(token);

  if (userStatus !== "Admin" && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.next();
}
