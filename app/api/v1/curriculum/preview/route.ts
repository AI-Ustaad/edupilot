export const dynamic = 'force-dynamic';
import { curriculumMap } from "@/lib/curriculum-data";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.curriculum.view)(async (req: Request, {}: TenantContext) => {
        const { schoolType, level } = await req.json();
        const curriculum = curriculumMap[schoolType as keyof typeof curriculumMap]?.[level];
        if (!curriculum) return createErrorResponse(400, "Invalid school type or level");
        return createSuccessResponse({
          classes: curriculum.classes,
          subjects: curriculum.subjects,
        });
      })
    )
  )
);
