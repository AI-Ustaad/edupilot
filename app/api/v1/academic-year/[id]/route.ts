export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
// ... باقی کوڈ
export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

function getId(req: Request): string {
  const segments = new URL(req.url).pathname.split("/");
  return segments[segments.length - 1];
}

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const id = getId(req);
        const { isCurrent } = await req.json();
        if (isCurrent) {
          const all = await adminDb.collection("academicYears")
            .where("tenantId", "==", tenantId).get();
          const batch = adminDb.batch();
          all.docs.forEach(doc => batch.update(doc.ref, { isCurrent: false }));
          await batch.commit();
        }
        await adminDb.collection("academicYears").doc(id).update({
          isCurrent: !!isCurrent,
          updatedAt: new Date(),
        });
        return createApiResponse(200, null, "Updated");
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const id = getId(req);
        await adminDb.collection("academicYears").doc(id).delete();
        return createApiResponse(200, null, "Deleted");
      })
    )
  )
);
