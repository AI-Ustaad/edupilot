import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { ParentsService } from "@/services/parents.service";
import { ParentsRepository } from "@/repositories/parents.repository";
import { StudentRepository } from "@/repositories/student.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["parent"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const parentService = new ParentsService(new ParentsRepository(), new StudentRepository());
        const children = await parentService.getChildren(user.uid, tenantId);
        // بعد میں ResultsService سے جوڑیں
        return createApiResponse(200, children.map(child => ({
          student: child,
          results: [] // عارضی
        })));
      })
    )
  )
);
