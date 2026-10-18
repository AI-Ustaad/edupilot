export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { FeesService } from "@/services/fees.service";
import { createSuccessResponse, createApiResponse } from "@/lib/api/response";

const feesService = new FeesService();

export const GET = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.fees.view,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const url = new URL(req.url);
      const month = url.searchParams.get("month") || undefined;
      const classGrade = url.searchParams.get("classGrade") || undefined;
      const section = url.searchParams.get("section") || undefined;
      const studentId = url.searchParams.get("studentId") || undefined;
      const page = parseInt(url.searchParams.get("page") || "1", 10);
      const limit = parseInt(url.searchParams.get("limit") || "50", 10);

      const result = await feesService.listFees(
        tenantId,
        { studentId, month, classGrade, section },
        page,
        limit
      );
      return createSuccessResponse(result.data, { meta: { total: result.total, page: result.page, totalPages: result.totalPages } });
    }
  )
);

export const POST = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.fees.create,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      const body = await req.json();
      const fee = await feesService.createFee(body, tenantId, context.user.uid);
      return createApiResponse(201, fee, "Fee collected");
    }
  )
);

