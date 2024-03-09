import { NextResponse } from "next/server";

export async function GET() {
  console.log("testeererbrtrth");

  return NextResponse.json({ ok: true });
}
