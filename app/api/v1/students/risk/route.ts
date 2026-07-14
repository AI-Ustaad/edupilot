export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { StudentService } from "@/services/StudentService";
import { logger } from "@/lib/logger/logger";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      async (req: Request, { tenantId }: TenantContext) => {
        try {
          const studentService = new StudentService();
          const riskStudents = await studentService.getRiskData(tenantId);
          return createSuccessResponse(riskStudents);
        } catch (error: any) {
          logger.error("Risk API Error:", { metadata: { error } });
          return createSuccessResponse([]);
        }
      }
    )
  )
);
