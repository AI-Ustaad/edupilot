import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(user);
}
