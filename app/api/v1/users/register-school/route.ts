// app/api/users/register-school/route.ts
import { NextRequest } from "next/server";
import { adminDb, adminAuth, dbTimestamp } from "@/lib/firebase-admin";
import { getSessionUser } from "@/lib/auth/auth-server";
import { logger } from "@/lib/logger/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { eventBus } from "@/lib/events/event-bus";
import { EVENTS } from "@/lib/events/event-types";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return createErrorResponse(401, "Unauthorized");
    }

    const body = await req.json();
    const { schoolName, type, curriculum, classes, subjects } = body;

    if (!schoolName || !classes || !subjects) {
      return createErrorResponse(400, "Missing required setup data");
    }

    const tenantId = user.tenantId || `tenant_${user.uid}`;
    const now = new Date().toISOString();
    const batch = adminDb.batch();

    // 1. User Document update (Admin Role + Onboarding Complete)
    const userRef = adminDb.collection("users").doc(user.uid);
    batch.update(userRef, {
      onboardingRequired: false,
      role: "admin",
      tenantId: tenantId,
      updatedAt: new Date(),
    });

    // 2. Tenant (School) Document
    const tenantRef = adminDb.collection("tenants").doc(tenantId);
    batch.set(tenantRef, {
      name: schoolName,
      type: type || "Private",
      curriculum: curriculum || "custom",
      ownerId: user.uid,
      status: "active",
      createdAt: new Date(),
    }, { merge: true });

    // 3. Settings: Classes, Subjects + Grading Rules + Exam Terms + Fee Categories
    const settingsRef = adminDb.collection("tenants").doc(tenantId).collection("settings").doc("config");
    batch.set(settingsRef, {
      classes,
      subjects,
      gradingRules: [
        { grade: "A++", min: 90, max: 100 },
        { grade: "A+", min: 80, max: 89 },
        { grade: "A", min: 70, max: 79 },
        { grade: "B", min: 60, max: 69 },
        { grade: "C", min: 50, max: 59 },
        { grade: "D", min: 40, max: 49 },
        { grade: "F", min: 0, max: 39 },
      ],
      examTerms: [
        { name: "First Term", order: 1, active: true },
        { name: "Midterm", order: 2, active: true },
        { name: "Final Term", order: 3, active: true },
      ],
      feeCategories: [
        { name: "Tuition", description: "Monthly tuition fee", active: true },
        { name: "Exam Fee", description: "Examination fee", active: true },
        { name: "Transport", description: "Transport fee", active: true },
      ],
      promotionRules: { minPercentage: 40, autoPromote: false },
      updatedAt: now,
    }, { merge: true });

    // 4. Sections: default "A" for each class
    const sectionsRef = adminDb.collection("sections");
    const oldSections = await sectionsRef.where("tenantId", "==", tenantId).get();
    oldSections.docs.forEach(doc => batch.delete(doc.ref));

    classes.forEach((cls: any) => {
      if (cls.name) {
        const newSecRef = sectionsRef.doc();
        batch.set(newSecRef, {
          tenantId,
          classGrade: cls.name,
          sectionName: "A",
          createdAt: now,
        });
      }
    });

    // 5. Departments
    const defaultDepartments = [
      { name: "Admin", description: "Administrative department", tenantId, createdAt: now },
      { name: "Academic", description: "Teaching and academic staff", tenantId, createdAt: now },
      { name: "Support", description: "Support and maintenance staff", tenantId, createdAt: now },
    ];
    defaultDepartments.forEach(dept => {
      const deptRef = adminDb.collection("departments").doc();
      batch.set(deptRef, dept);
    });

    // 6. Designations
    const defaultDesignations = [
      { name: "Principal", description: "School principal", tenantId, createdAt: now },
      { name: "Vice-Principal", description: "Vice principal", tenantId, createdAt: now },
      { name: "HOD", description: "Head of department", tenantId, createdAt: now },
      { name: "Teacher", description: "Class teacher", tenantId, createdAt: now },
    ];
    defaultDesignations.forEach(desig => {
      const desigRef = adminDb.collection("designations").doc();
      batch.set(desigRef, desig);
    });

    // 7. Commit batch
    await batch.commit();

    // 8. Create Academic Year (outside batch — uses repository)
    const academicYearRepo = new AcademicYearRepository();
    const currentYear = new Date().getFullYear();
    const ayId = await academicYearRepo.create({
      name: `${currentYear}-${currentYear + 1}`,
      startDate: `${currentYear}-04-01`,
      endDate: `${currentYear + 1}-03-31`,
      isCurrent: true,
      tenantId,
      createdBy: user.uid,
    }, tenantId);

    // 9. Custom Claims
    await adminAuth.setCustomUserClaims(user.uid, {
      tenantId,
      role: "admin",
    });

    // 10. Publish SCHOOL_SETUP_COMPLETED event
    eventBus.publish(EVENTS.SCHOOL_SETUP_COMPLETED, {
      tenantId,
      schoolName,
      classesCount: classes.length,
      subjectsCount: subjects.length,
      academicYearId: ayId,
      createdBy: user.uid,
    });

    return createSuccessResponse(null, { message: "School setup completed successfully" });

  } catch (error: any) {
    logger.error("Register School API Error:", { metadata: { error: error.message } });
    return createErrorResponse(500, "Internal server error during setup");
  }
}
