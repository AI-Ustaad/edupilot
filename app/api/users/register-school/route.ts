import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. سیشن کوکی حاصل کریں
    const session = cookies().get("session")?.value;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No session found" }, { status: 401 });
    }

    // 2. سیشن کو وریفائی کریں اور یوزر کی UID نکالیں
    const decoded = await adminAuth.verifySessionCookie(session, true);
    const { schoolName, phone } = await req.json();

    if (!schoolName || !phone) {
      return NextResponse.json({ error: "School name and phone are required" }, { status: 400 });
    }

    const userRef = adminDb.collection("users").doc(decoded.uid);
    const userDoc = await userRef.get();

    // 3. چیک کریں کہ کیا یوزر پہلے سے رجسٹرڈ تو نہیں؟
    if (userDoc.exists && userDoc.data()?.role) {
      return NextResponse.json({ error: "User already registered" }, { status: 400 });
    }

    // 🔥 سٹیپ 1: یوزر کو Firestore میں 'admin' کے طور پر سیو کریں
    await userRef.set({
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || "School Admin",
      role: "admin",
      phone: phone,
      createdAt: new Date(),
    });

    // 🔥 سٹیپ 2 (اہم ترین): فائر بیس ٹوکن کے اندر 'admin' کا رول (Custom Claim) انجیکٹ کریں
    // اس سے سیکیورٹی رولز فوری طور پر اسے پہچان لیں گے
    await adminAuth.setCustomUserClaims(decoded.uid, {
      role: "admin"
    });

    // 4. اسکول کی بنیادی سیٹنگز (Global Config) کو اپڈیٹ کریں
    await adminDb.collection("settings").doc("globalConfig").set({
      registeredName: schoolName.toUpperCase(),
      phone: phone,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ 
      success: true, 
      message: "School registered and Admin role assigned successfully" 
    });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Registration failed: " + error.message }, { status: 500 });
  }
}
