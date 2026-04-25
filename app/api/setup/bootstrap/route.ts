import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { getUserFromSession } from "@/lib/auth-utils";
import { generateClasses, generateSubjects } from "@/lib/school-config";

export async function POST(req: Request) {
  const session = cookies().get("session")?.value;
  const user = await getUserFromSession(session);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { schoolType, board, level, sections, periods } = await req.json();

  const tenantId = user.tenantId;

  // 1️⃣ Generate Classes
  const classes = generateClasses(level, schoolType);

  for (const cls of classes) {
    await adminDb.collection("classes").add({
      name: cls,
      tenantId,
    });

    // 2️⃣ Subjects per class
    const subjects = generateSubjects(board, level, cls);

    for (const sub of subjects) {
      await adminDb.collection("subjects").add({
        name: sub,
        class: cls,
        tenantId,
      });
    }
  }

  // 3️⃣ Sections
  for (const sec of sections) {
    await adminDb.collection("sections").add({
      name: sec,
      tenantId,
    });
  }

  // 4️⃣ Periods
  for (const p of periods) {
    await adminDb.collection("periods").add({
      name: p,
      tenantId,
    });
  }

  // 5️⃣ Mark setup complete
  await adminDb.collection("tenants").doc(tenantId).update({
    setupCompleted: true,
    schoolType,
    board,
    level,
  });

  return NextResponse.json({ success: true });
}
