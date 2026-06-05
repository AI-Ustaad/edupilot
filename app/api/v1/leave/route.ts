export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { teacherId, startDate, endDate, reason } = await req.json();
      const docRef = await adminDb.collection("leave_requests").add({
        teacherId, startDate, endDate, reason,
        tenantId,
        status: "pending",
        createdAt: new Date(),
      });
      return createApiResponse(201, { id: docRef.id });
    })
  )
);
