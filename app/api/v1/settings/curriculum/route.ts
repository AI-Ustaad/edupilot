// app/api/v1/settings/curriculum/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";
import { logger } from "@/lib/logger/logger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !user.tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classes, subjects, schoolType, curriculum, levels } = await req.json();

    if (!classes || !subjects) {
      return NextResponse.json({ error: "Classes and Subjects are required" }, { status: 400 });
    }

    const batch = adminDb.batch();

    // 1. Settings Document (Classes & Subjects) اپ ڈیٹ کریں
    const settingsRef = adminDb.collection("tenants").doc(user.tenantId).collection("settings").doc("config");
    batch.set(settingsRef, {
      classes: classes,
      subjects: subjects,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 2. General Settings میں Type اور Curriculum سیٹ کریں
    const generalRef = adminDb.collection("tenants").doc(user.tenantId).collection("settings").doc("general");
    batch.set(generalRef, {
      schoolType: schoolType,
      affiliation: curriculum,
      levelsOffered: levels,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // 3. Sections Collection خودکار Popultate کریں
    const sectionsRef = adminDb.collection("sections");
    const oldSections = await sectionsRef.where("tenantId", "==", user.tenantId).get();
    oldSections.docs.forEach(doc => batch.delete(doc.ref));

    classes.forEach((cls: any) => {
      if (cls.name) {
        const newSecRef = sectionsRef.doc();
        batch.set(newSecRef, {
          tenantId: user.tenantId,
          classGrade: cls.name,
          sectionName: "A", // ڈیفالٹ سیکشن
          createdAt: new Date().toISOString()
        });
      }
    });

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: "Curriculum applied successfully! Classes and Subjects have been updated." 
    });

  } catch (error: any) {
    logger.error("Curriculum Apply Error:", { metadata: { error: error.message } });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
