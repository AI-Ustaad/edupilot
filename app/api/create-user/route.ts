import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { getUserFromSession, requireRole } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;
    const currentUser = await getUserFromSession(session);

    // 1. Check Auth & Admin Role
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!requireRole(currentUser, "admin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { uid, email, password, role, displayName } = await req.json();

    // 2. Create Firebase Auth User
    const userRecord = await adminAuth.createUser({
      uid, 
      email, 
      password, 
      displayName
    });

    const assignedRole = role || "teacher";

    // 👉 THE MAGIC (STEP 1): فائر بیس ٹوکن کے اندر رول (Custom Claim) انجیکٹ کریں
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      role: assignedRole
    });

    // 3. Save to Firestore 'users' collection (Master Record)
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      role: assignedRole,
      name: displayName,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
