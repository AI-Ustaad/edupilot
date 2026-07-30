export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { ParentsService } from "@/services/parents.service";
import { FeesService } from "@/services/fees.service";
import type { TenantContext } from "@/types/api";
import { withPermission } from '@/lib/auth/rbac';
import { PERMISSIONS } from '@/lib/auth/permissions';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.parents.view)(async (req: Request, { tenantId, user }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.searchParams.get('studentId');

        const parentService = new ParentsService();
        const childIds = await parentService.getChildIds(user.uid, tenantId);
        if (childIds.length === 0) return createSuccessResponse([]);

        const feesService = new FeesService();
        let allFees: any[] = [];
        for (const id of childIds) {
          const result = await feesService.listFees(tenantId, id);
          allFees = allFees.concat(result.data);
        }
        if (studentId) {
          allFees = allFees.filter(f => f.studentId === studentId);
        }
        return createSuccessResponse(allFees);
      })
    )
  )
);
