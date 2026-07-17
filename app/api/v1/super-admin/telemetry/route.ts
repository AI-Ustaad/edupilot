// app/api/v1/super-admin/telemetry/route.ts
import { getSessionUser } from "@/lib/auth/auth-server";
import { TelemetryService } from "@/services/telemetry.service";
import * as Sentry from "@sentry/nextjs";
import { logger } from "@/lib/logger/logger";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "super_admin") {
      return createErrorResponse(403, "Forbidden: Super Admin access required");
    }

    const telemetryService = new TelemetryService();
    const metrics = await telemetryService.getSaaSMetrics();

    return createSuccessResponse(metrics);

  } catch (error: any) {
    Sentry.captureException(error);
    logger.error("Telemetry API Error:", { metadata: { error: error.message } });
    return createErrorResponse(500, "Internal Server Error");
  }
}
