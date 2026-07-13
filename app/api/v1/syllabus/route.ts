export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { SyllabusRepository } from "@/repositories/syllabus.repository";
import type { TenantContext } from "@/types/api";

const syllabusRepo = new SyllabusRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const classGrade = searchParams.get("class");
      const subject = searchParams.get("subject");

      const data = await syllabusRepo.findWithFilters(tenantId, {
        classGrade: classGrade || undefined,
        subject: subject || undefined,
      });
      return createSuccessResponse(data);
    })
  )
);
