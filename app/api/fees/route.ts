import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getUserFromSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";

// 🔍 فیس کا ریکارڈ منگوانے کی API
export async function GET() {
  try {
    const session = cookies().get("session")?.value;
    const user = await getUserFromSession(session);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const snap = await adminDb
      .collection("fees")
      .where("tenantId", "==", user.tenantId) // 👈 100% Tenant Security
      .orderBy("timestamp", "desc")
      .get();

    return NextResponse.json(snap.docs.map((d: any) => ({ id: d.id, ...d.data() })));
  } catch (error) {
    console.error("Fee Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 });
  }
}

// 💰 نئی فیس رسید سیو کرنے کی API
export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;
    const user = await getUserFromSession(session);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    
    await adminDb.collection("fees").add({
      ...data,
      tenantId: user.tenantId, // 👈 Tenant Security
      collectedBy: user.uid,
      timestamp: new Date().toISOString() // Date format fixed for easy sorting
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fee Save Error:", error);
    return NextResponse.json({ error: "Failed to save fee record" }, { status: 500 });
  }
}
