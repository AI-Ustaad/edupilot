// app/api/v1/users/register-school/route.ts
import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";
import { TenantService } from "@/services/tenant.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return createErrorResponse(401, "Unauthorized");
    }

    const body = await req.json().catch(() => ({}));
    const { schoolName, type, curriculum, classes, subjects, phone } = body;

    if (!schoolName || typeof schoolName !== "string" || schoolName.trim().length === 0) {
      return createErrorResponse(400, "School name is required");
    }

    const normalizedSchoolName = schoolName.trim();

    const defaultClasses = [
      { name: "Class 1", order: 1 },
      { name: "Class 2", order: 2 },
      { name: "Class 3", order: 3 },
      { name: "Class 4", order: 4 },
      { name: "Class 5", order: 5 },
      { name: "Class 6", order: 6 },
      { name: "Class 7", order: 7 },
      { name: "Class 8", order: 8 },
      { name: "Class 9", order: 9 },
      { name: "Class 10", order: 10 },
    ];

    const defaultSubjects = [
      "English",
      "Mathematics",
      "Science",
      "Urdu",
      "Islamiyat",
      "Social Studies",
      "Computer Science",
    ];

    const setupClasses = Array.isArray(classes) && classes.length > 0 ? classes : defaultClasses;
    const setupSubjects = Array.isArray(subjects) && subjects.length > 0 ? subjects : defaultSubjects;

    const tenantService = new TenantService();
    const { tenantId } = await tenantService.setupSchool({
      schoolName: normalizedSchoolName,
      type: type || "Private",
      curriculum: curriculum || "General / SNC",
      classes: setupClasses,
      subjects: setupSubjects,
      userId: user.uid,
    });

    const ayId = await tenantService.initializeAcademicYear(tenantId, user.uid);

    // Set custom user claims so client token refreshes carry tenantId and role: "admin"
    await adminAuth.setCustomUserClaims(user.uid, {
      tenantId,
      schoolId: tenantId,
      role: "admin",
    });

    // Save phone to user doc if provided
    if (phone) {
      await adminDb.collection("users").doc(user.uid).set(
        { phone, updatedAt: new Date() },
        { merge: true }
      );
    }

    eventBus.publish(
      EVENTS.SCHOOL_SETUP_COMPLETED,
      {
        tenantId,
        schoolName: normalizedSchoolName,
        classesCount: setupClasses.length,
        subjectsCount: setupSubjects.length,
        academicYearId: ayId,
        createdBy: user.uid,
      },
      tenantId
    );

    return createSuccessResponse(
      { tenantId, schoolName: normalizedSchoolName },
      { message: "School setup completed successfully" }
    );
  } catch (error: any) {
    logger.error("Register School API Error:", { metadata: { error: error.message } });
    return createErrorResponse(500, error?.message || "Internal server error during setup");
  }
}
