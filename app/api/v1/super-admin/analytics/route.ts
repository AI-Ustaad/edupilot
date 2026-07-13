export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { StudentRepository } from "@/repositories/student.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import { FeesService } from "@/services/fees.service";
import { adminDb } from "@/lib/firebase-admin";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.analytics.view)(async (req: Request, { tenantId }: TenantContext) => {
        const tenantsSnap = await adminDb.collection("tenants").get();
        const studentRepo = new StudentRepository();
        const staffRepo = new StaffRepository();
        const feesService = new FeesService();

        const tenants = await Promise.all(
          tenantsSnap.docs.map(async (doc) => {
            const tid = doc.id;
            const [students, staff, revenue] = await Promise.all([
              studentRepo.count(tid),
              staffRepo.count(tid),
              feesService.getTotalRevenue(tid),
            ]);
            return {
              tenantId: tid,
              name: doc.data().name,
              students,
              staff,
              revenue,
            };
          })
        );
        return createSuccessResponse({ tenants });
      })
    )
  )
);
