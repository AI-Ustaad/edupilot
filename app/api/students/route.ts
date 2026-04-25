// app/api/students/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getUserFromSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function GET() {
  const session = cookies().get("session")?.value;
  const user = await getUserFromSession(session);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const snap = await adminDb
    .collection("students")
    .where("tenantId", "==", user.tenantId)
    .get();

  return NextResponse.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
}

export async function POST(req: Request) {
  const session = cookies().get("session")?.value;
  const user = await getUserFromSession(session);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "teacher"].includes(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const data = await req.json();

  const doc = await adminDb.collection("students").add({
    ...data,
    tenantId: user.tenantId,
    createdAt: new Date(),
  });

  return NextResponse.json({ id: doc.id });
}
