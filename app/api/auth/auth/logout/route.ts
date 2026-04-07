import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("session");
  return NextResponse.json({ status: "success" }, { status: 200 });
}
