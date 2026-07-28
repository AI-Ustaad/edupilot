export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { SyllabusService } from "@/services/syllabus.service";
import type { TenantContext } from "@/types/api";

const syllabusService = new SyllabusService();

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const classGrade = searchParams.get("class");
      const subject = searchParams.get("subject");

      const data = await syllabusService.findWithFilters(tenantId, {
        classGrade: classGrade || undefined,
        subject: subject || undefined,
      });
      return createSuccessResponse(data);
    })
  )
);
