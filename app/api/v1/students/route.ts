export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StudentService } from "@/services/StudentService";
import { SubscriptionService } from "@/services/subscription.service";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";

const subscriptionService = new SubscriptionService();

export const GET = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.view, async (req, context) => {
    const tenantId = context.user.tenantId;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "9999", 10);
    const classGrade = searchParams.get("classGrade") || undefined;
    const section = searchParams.get("section") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const academicYear = searchParams.get("academicYear") || undefined;

    const service = new StudentService();
    const result = (classGrade || section || status || search || gender || academicYear)
      ? await service.advancedFilter(tenantId, {
          classGrade,
          section,
          status,
          search,
          gender,
          academicYear,
          page,
          limit,
        })
      : await service.paginate(tenantId, page, limit);

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
    const limits = await subscriptionService.getPlanLimits(tenantId);
    await service.checkSubscriptionLimit(tenantId, limits.maxStudents, 1);

    const student = await service.create(body, tenantId, context.user.uid);
    return createApiResponse(201, student, "Student admitted");
  })
);

export const PUT = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.update, async (req, context) => {
    const tenantId = context.user.tenantId;
    let body;
    try {
      body = await req.json();
    } catch {
      return createErrorResponse(400, "Invalid JSON");
    }

    const { searchParams } = new URL(req.url);
    const id = body?.id || searchParams.get("id");
    if (!id) return createErrorResponse(400, "Student ID is required");

    const service = new StudentService();
    const updated = await service.update(tenantId, id, body, context.user.uid);
    return createSuccessResponse(updated, { message: "Student updated" });
  })
);

export const PATCH = PUT;

export const DELETE = withErrorHandler(
  withAuthAndPermission(PERMISSIONS.students.delete, async (req, context) => {
    const tenantId = context.user.tenantId;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return createErrorResponse(400, "Student ID is required");

    const service = new StudentService();
    await service.delete(tenantId, id, context.user.uid);
    return createSuccessResponse(null, { message: "Student deleted" });
  })
);

