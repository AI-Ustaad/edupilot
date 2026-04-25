import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getUserFromSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";

// 🔍 حاضری چیک کرنے کی API
export async function GET(req: Request) {
  try {
    const session = cookies().get("session")?.value;
    const user = await getUserFromSession(session);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const classGrade = searchParams.get("classGrade");
    const section = searchParams.get("section");

    let queryRef: any = adminDb.collection("attendance").where("tenantId", "==", user.tenantId);
    
    if (date) queryRef = queryRef.where("date", "==", date);
    if (classGrade) queryRef = queryRef.where("classGrade", "==", classGrade);
    if (section) queryRef = queryRef.where("section", "==", section);

    const snap = await queryRef.get();
    return NextResponse.json(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

// 💾 حاضری سیو کرنے کی API (Batch Write)
export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;
    const user = await getUserFromSession(session);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const records = await req.json();
    const batch = adminDb.batch();

    records.forEach((record: any) => {
      // Unique ID تاکہ ایک دن میں ایک بچے کی دو حاضریاں نہ لگیں
      const docId = `${record.studentId}_${record.date}`;
      const ref = adminDb.collection("attendance").doc(docId);
      
      batch.set(ref, {
        ...record,
        tenantId: user.tenantId, // 👈 Tenant Security
        markedBy: user.uid,
        timestamp: new Date()
      });
    });

    await batch.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
