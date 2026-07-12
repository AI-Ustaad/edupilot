export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse } from "@/lib/api/response";
import { StudentRepository } from "@/repositories/student.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const tenantsSnap = await adminDb.collection("tenants").get();
        const studentRepo = new StudentRepository();
        const staffRepo = new StaffRepository();

        const tenants = await Promise.all(
          tenantsSnap.docs.map(async (doc) => {
            const tid = doc.id;
            const [students, staff, fees] = await Promise.all([
              studentRepo.count(tid),
              staffRepo.count(tid),
              adminDb.collection("fees").where("tenantId", "==", tid).get(),
            ]);
            const revenue = fees.docs.reduce((sum, f) => sum + (f.data().amountPaid || 0), 0);
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
