export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";

export async function GET() {
  const user = await getSessionUser();
  
  if (!user) {
    return NextResponse.json({ role: "teacher" }); // Fallback
  }

  return NextResponse.json(user);
}
