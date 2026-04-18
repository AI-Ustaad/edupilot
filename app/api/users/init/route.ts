import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import admin from "firebase-admin";

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      const schoolId = "school_" + Math.random().toString(36).slice(2, 8);

      await userRef.set({
        uid,
        email: decoded.email || "",
        role: "admin",
        schoolId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return NextResponse.json({ schoolId });
    } else {
      return NextResponse.json(doc.data());
    }
  } catch (error) {
    return NextResponse.json({ error: "init failed" }, { status: 500 });
  }
}
