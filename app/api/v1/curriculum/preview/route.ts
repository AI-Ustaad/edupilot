export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ success: false, error: "This legacy endpoint is deprecated. Use /api/v1/curriculum/engine instead." }, { status: 410 });
}
