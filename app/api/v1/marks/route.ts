export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { MarksService } from "@/services/marks.service";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { normalizeTerm } from "@/lib/utils/formatClassLabel";
import type { TenantContext } from "@/types/api";

const marksService = new MarksService();

// ==========================================
// 1. GET: Fetch Marks
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.marks.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const rawTerm = searchParams.get("term") || searchParams.get("examType");
        const filters = {
          classGrade: searchParams.get("classGrade") || undefined,
          section: searchParams.get("section") || undefined,
          term: rawTerm ? normalizeTerm(rawTerm) : undefined,
          subject: searchParams.get("subject") || undefined,
          studentId: searchParams.get("studentId") || undefined,
        };

        const marks = await marksService.listMarks(tenantId, filters);
        return createSuccessResponse(marks);
      })
    )
  )
);

// ==========================================
// 2. POST: Save or Update a Mark (Idempotent)
// ==========================================
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.marks.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        if (body.term) body.term = normalizeTerm(body.term);
        if (body.examType) body.examType = normalizeTerm(body.examType);
        const result = await marksService.saveMark(body, tenantId, user.uid);
        return createApiResponse(200, result, result.message);
      })
    )
  )
);

// ==========================================
// 3. DELETE: Soft Delete a Mark
// ==========================================
export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.marks.update)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const markId = searchParams.get("id");
        if (!markId) return createErrorResponse(400, "Mark ID is required");

        await marksService.deleteMark(markId, tenantId, user.uid);
        return createSuccessResponse(null, { message: "Mark archived successfully" });
      })
    )
  )
);
