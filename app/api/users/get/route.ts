import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const session = cookies().get("session")?.value;
    const decoded = await adminAuth.verifySessionCookie(session!);

    const doc = await adminDb.collection("users").doc(decoded.uid).get();

    return NextResponse.json(doc.data());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
