import { NextResponse } from "next/server";

import { jwtVerify } from "@/utils/jwtVerify";
import { checkGuestAllowed } from "@/utils/checkGuestAllowed";

export async function middleware(request) {
  //isolate the client's requested path
  if (request.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("SG_token");

  if (
    !token &&
    request.nextUrl.pathname !== "/" &&
    request.nextUrl.pathname !== "/signin" &&
    request.nextUrl.pathname !== "/admin"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { userStatus } = await jwtVerify(token);
  console.log("userStatus", userStatus);

  if (
    token &&
    // (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/signin")
    (request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname === "/signin") &&
    userStatus !== "Guest"
  ) {
    return NextResponse.redirect(new URL("/categories", request.url));
  }

  if (
    userStatus === "Guest" &&
    request.nextUrl.pathname !== "/guest" &&
    !checkGuestAllowed(request.nextUrl.href)
  ) {
    return NextResponse.redirect(new URL("/guest", request.url));
  }
  // const isGuestAllowed = checkGuestAllowed(request.nextUrl.href);
  // console.log("isGuestAllowed", isGuestAllowed);
  // const { userStatus } = await jwtVerify(token);
  // console.log("userStatus", userStatus);

  if (
    userStatus !== "Admin" &&
    request.nextUrl.pathname.startsWith("/admin/app-edition")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (userStatus === "User" && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (
    userStatus === "Admin" &&
    !request.nextUrl.pathname.startsWith("/admin/app-edition")
  ) {
    return NextResponse.redirect(new URL("/admin/app-edition", request.url));
  }

  return NextResponse.next();
}
