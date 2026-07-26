export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { UserRepository } from "@/repositories/user.repository";

const userRepo = new UserRepository();

export async function GET() {
  try {
    const session = cookies().get("session")?.value;

    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(session);

    const existingUser = await userRepo.findByUidWithFallback(decoded.uid, decoded.email);
    if (existingUser) {
      return NextResponse.json({ success: true });
    }

    await userRepo.create({
      uid: decoded.uid,
      email: decoded.email,
      role: "guest",
      tenantId: null,
      onboardingRequired: true,
      createdAt: new Date(),
    } as any);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
