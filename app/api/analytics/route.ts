import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const tenantsSnap = await adminDb.collection("tenants").get();
        const tenants = await Promise.all(
          tenantsSnap.docs.map(async (doc) => {
            const tid = doc.id;
            const [students, staff, fees] = await Promise.all([
              adminDb.collection("students").where("tenantId", "==", tid).count().get(),
              adminDb.collection("staff").where("tenantId", "==", tid).count().get(),
              adminDb.collection("fees").where("tenantId", "==", tid).get(),
            ]);
            const revenue = fees.docs.reduce((sum, f) => sum + (f.data().amountPaid || 0), 0);
            return {
              tenantId: tid,
              name: doc.data().name,
              students: students.data().count,
              staff: staff.data().count,
              revenue,
            };
          })
        );
        return createApiResponse(200, { tenants });
      })
    )
  )
);
