export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb
        .collection("timetable_entries")
        .where("tenantId", "==", tenantId)
        .get();
      const entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      return createApiResponse(200, { entries });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const docRef = await adminDb.collection("timetable_entries").add({
          ...body,
          tenantId,
          createdAt: new Date(),
        });
        return createApiResponse(201, { id: docRef.id });
      })
    )
  )
);
