// app/api/dashboard/route.ts
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";

interface WithTenantContext {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
      try {
        const [studentsCount, staffCount, feesSnapshot] = await Promise.all([
          adminDb.collection("students").where("tenantId", "==", tenantId).count().get(),
          adminDb.collection("staff").where("tenantId", "==", tenantId).count().get(),
          adminDb.collection("fees").where("tenantId", "==", tenantId).get(),
        ]);

        const totalRevenue = feesSnapshot.docs.reduce((sum, doc) => sum + (doc.data().amountPaid || 0), 0);

        return createApiResponse(200, {
          students: studentsCount.data().count,
          staff: staffCount.data().count,
          revenue: totalRevenue,
          attendance: 0, // Will be implemented later
        });
      } catch (err: any) {
        console.error("Error fetching dashboard:", err);
        return createApiResponse(500, null, "Failed to fetch dashboard data");
      }
    })
  )
);
