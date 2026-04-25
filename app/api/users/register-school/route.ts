import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // سیشن وریفائی کریں
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const { schoolName, phone } = await req.json();

    const userRef = adminDb.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();

    // اگر یوزر پہلے سے موجود ہے تو اسے دوبارہ رجسٹر نہ ہونے دیں
    if (userDoc.exists && userDoc.data()?.role) {
      return NextResponse.json({ error: "User already registered" }, { status: 400 });
    }

    // 1. نئے یوزر کو ADMIN کا رول دے کر سیو کریں
    await userRef.set({
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || "School Admin",
      role: "admin", // 🔥 نیا بندہ آٹومیٹک ایڈمن بنے گا
      phone: phone,
      createdAt: new Date(),
    });

    // 2. اس کے اسکول کا نام Settings میں سیو کر دیں
    await adminDb.collection("settings").doc("globalConfig").set({
      registeredName: schoolName.toUpperCase(),
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
