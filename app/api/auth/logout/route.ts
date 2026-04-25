import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  // یہ سرور سے یوزر کی سیشن کوکی کو ہمیشہ کے لیے اڑا دے گا
  cookies().delete("session");
  return NextResponse.json({ success: true });
}
