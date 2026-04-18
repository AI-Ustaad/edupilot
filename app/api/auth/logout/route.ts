import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // سیشن کُکی ڈیلیٹ کریں
    cookies().set("session", "", { maxAge: 0 });
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
