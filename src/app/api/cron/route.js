import { NextResponse } from "next/server";

export async function GET() {
  const result = "testzefmv,f";
  console.log(result);

  return NextResponse.json({ data: result });
}
