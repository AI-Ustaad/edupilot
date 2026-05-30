import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { ParentsService } from "@/services/parents.service";
import { ParentsRepository } from "@/repositories/parents.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { FeesService } from "@/services/fees.service";
import { FeesRepository } from "@/repositories/fees.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["parent"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.searchParams.get('studentId');

        const parentService = new ParentsService(new ParentsRepository(), new StudentRepository());
        const childIds = await parentService.getChildIds(user.uid, tenantId);
        if (childIds.length === 0) return createApiResponse(200, []);

        const feesService = new FeesService(new FeesRepository());
        let allFees: any[] = [];
        for (const id of childIds) {
          const result = await feesService.listFees(tenantId, id);
          allFees = allFees.concat(result.data);
        }
        if (studentId) {
          allFees = allFees.filter(f => f.studentId === studentId);
        }
        return createApiResponse(200, allFees);
      })
    )
  )
);
