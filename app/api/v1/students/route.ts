export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

export const GET = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.view, async (req, context) => {
    const tenantId = context.user.tenantId;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "9999", 10);
    const service = new StudentService();
    const result = await service.paginate(tenantId, page, limit);
    return createSuccessResponse(result.data, {
      message: "Students fetched",
      meta: { total: result.total, page: result.page, totalPages: result.totalPages },
    });
  })
);

export const POST = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.create, async (req, context) => {
    const tenantId = context.user.tenantId;
    let body;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse(400, "Invalid JSON");
    }

    const service = new StudentService();
    const student = await service.create(body, tenantId, context.user.uid);
    return createApiResponse(201, student, "Student admitted");
  })
);

