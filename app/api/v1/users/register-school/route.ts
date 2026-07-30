// app/api/users/register-school/route.ts
import { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/auth-server";
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

    const body = await req.json();
    const { schoolName, type, curriculum, classes, subjects } = body;

    if (!schoolName || !classes || !subjects) {
      return createErrorResponse(400, "Missing required setup data");
    }

    const tenantService = new TenantService();
    const { tenantId } = await tenantService.setupSchool({
      schoolName,
      type,
      curriculum,
      classes,
      subjects,
      userId: user.uid,
    });

    const ayId = await tenantService.initializeAcademicYear(tenantId, user.uid);

    eventBus.publish(EVENTS.SCHOOL_SETUP_COMPLETED, {
      tenantId,
      schoolName,
      classesCount: classes.length,
      subjectsCount: subjects.length,
      academicYearId: ayId,
      createdBy: user.uid,
    }, tenantId);

    return createSuccessResponse(null, { message: "School setup completed successfully" });

  } catch (error: any) {
    logger.error("Register School API Error:", { metadata: { error: error.message } });
    return createErrorResponse(500, "Internal server error during setup");
  }
}
