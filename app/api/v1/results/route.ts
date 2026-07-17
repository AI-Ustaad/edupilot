// Force dynamic rendering - uses session cookies for auth
export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { MarksService } from "@/services/marks.service";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

// ==========================================
// GET: Fetch Aggregated Results Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const classGrade = searchParams.get("classGrade");
        const section = searchParams.get("section");
        const term = searchParams.get("term");

        if (!classGrade || !section || !term) {
          return createErrorResponse(400, "Class, Section, and Term are required");
        }

        const service = new MarksService();
        const results = await service.getAggregatedResults(tenantId, classGrade, section, term);

        return createSuccessResponse(results);
      })
    )
  )
);
