import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().set("session", "", { maxAge: 0 });
  return NextResponse.json({ success: true });
}
