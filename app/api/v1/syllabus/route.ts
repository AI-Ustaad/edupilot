export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { SyllabusService } from "@/services/syllabus.service";
import type { TenantContext } from "@/types/api";

const syllabusService = new SyllabusService();

// B11 (26 Nov audit): this route exported only GET, so the Admin Syllabus
// page's POST (useCreateSyllabus) answered 405 and Add Material silently
// did nothing — no save, no toast, no audit entry.
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.syllabus.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const record = await syllabusService.createSyllabus(body, tenantId, user.uid);
        return createSuccessResponse(record, { message: "Material added" });
      })
    )
  )
);

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
