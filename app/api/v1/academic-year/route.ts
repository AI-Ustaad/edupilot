export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const snapshot = await adminDb
        .collection("academicYears")
        .where("tenantId", "==", tenantId)
        .orderBy("startDate", "desc")
        .get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return createSuccessResponse(data);
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        const { name, startDate, endDate, isCurrent } = body;
        if (!name || !startDate || !endDate) {
          return createErrorResponse(400, "Missing fields");
        }

        if (isCurrent) {
          const all = await adminDb.collection("academicYears")
            .where("tenantId", "==", tenantId).get();
          const batch = adminDb.batch();
          all.docs.forEach(doc => batch.update(doc.ref, { isCurrent: false }));
          await batch.commit();
        }

        const ref = await adminDb.collection("academicYears").add({
          name,
          startDate,
          endDate,
          isCurrent: !!isCurrent,
          tenantId,
          createdBy: user.uid,
          createdAt: new Date(),
        });
        return createApiResponse(201, { id: ref.id });
      })
    )
  )
);
