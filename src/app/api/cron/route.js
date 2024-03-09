import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const result = "testzefmv,f";
  console.log(result);

  return NextResponse.json({ data: result });
}
