export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthService } from "@/services/auth.service";

const authService = new AuthService();

export async function GET() {
  try {
    const session = cookies().get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const decoded = await authService.verifySessionCookie(session);

    await authService.getOrCreateUser(decoded.uid, decoded.email, "guest", null);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
