import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { curriculumMap } from "@/lib/curriculum-data";

export async function POST(req: Request) {
  try {
    const session = cookies().get("session")?.value;
    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(session);
    const uid = decoded.uid;

    const {
      schoolName,
      schoolType = "federal",
      schoolLevel = "primary",
      staffList = [],
      logoBase64,
      bannerBase64,
    } = await req.json();

    if (!schoolName || !schoolName.trim()) {
      return NextResponse.json({ error: "School name is required" }, { status: 400 });
    }

    const tenantId = `school_${Math.random().toString(36).substr(2, 9)}`;

    // 1. tenant دستاویز
    await adminDb.collection("tenants").doc(tenantId).set({
      name: schoolName.trim(),
      type: schoolType,
      level: schoolLevel,
      ownerId: uid,
      createdAt: new Date(),
    });

    // 2. صارف کے custom claims اور Firestore دستاویز
    await adminAuth.setCustomUserClaims(uid, {
      role: "admin",
      tenantId,
    });

    await adminDb.collection("users").doc(uid).set({
      uid,
      email: decoded.email,
      role: "admin",
      tenantId,
      schoolName: schoolName.trim(),
      onboardingCompleted: true,
      createdAt: new Date(),
    });

    // 3. برانڈنگ (لوگو، بینر)
    await adminDb.collection("whitelabel").doc(tenantId).set({
      schoolName: schoolName.trim(),
      logo: logoBase64 || "",
      banner: bannerBase64 || "",
      primaryColor: "#FFB6B8", // ڈیفالٹ
    });

    // 4. اسکول کی سیٹنگز (curriculum data سے کلاسز اور مضامین)
    const curriculum = curriculumMap[schoolType]?.[schoolLevel];
    if (curriculum) {
      const uniqueClasses = [...new Set(curriculum.classes)];
      const uniqueSubjects = [...new Set(curriculum.subjects)];

      // settings
      await adminDb.collection("settings").doc(tenantId).set({
        classes: uniqueClasses,
        subjects: uniqueSubjects,
        sections: [],
        periods: [],
        schoolType,
        schoolLevel,
        curriculumLoadedAt: new Date(),
      });

      // سیکشنز (ہر کلاس کے لیے ڈیفالٹ "A")
      const batch = adminDb.batch();
      for (const cls of uniqueClasses) {
        const ref = adminDb.collection("sections").doc();
        batch.set(ref, {
          classGrade: cls,
          sectionName: "A",
          incharge: "",
          tenantId,
          createdAt: new Date(),
        });
      }
      await batch.commit();
    } else {
      // کم از کم خالی سیٹنگز
      await adminDb.collection("settings").doc(tenantId).set({
        classes: [],
        subjects: [],
        sections: [],
        periods: [],
        schoolType,
        schoolLevel,
      });
    }

    // 5. اسٹاف کی ضروریات (staff_requirements)
    if (staffList.length > 0) {
      await adminDb.collection("staff_requirements").doc(tenantId).set({
        requirements: staffList,
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, tenantId });
  } catch (err: any) {
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
