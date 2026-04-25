import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { getUserFromSession, requireRole } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;
    
    // 1. سیشن سے یوزر نکالیں
    const currentUser = await getUserFromSession(session);

    // 2. کیا یوزر لاگ ان ہے؟
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. کیا یوزر اصلی 'admin' ہے؟ (RBAC Check)
    if (!requireRole(currentUser, "admin")) {
      return NextResponse.json({ error: "Forbidden: Only admins can perform this action" }, { status: 403 });
    }

    // 4. اب وہ نیا یوزر بنا سکتا ہے
    const { uid, email, password, role, displayName } = await req.json();

    // Firebase Auth میں نیا اکاؤنٹ بنائیں
    const userRecord = await adminAuth.createUser({
      uid, 
      email, 
      password, 
      displayName
    });

    // Users کلیکشن میں ڈیٹا سیو کریں
    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      role: role || "teacher",
      name: displayName,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
