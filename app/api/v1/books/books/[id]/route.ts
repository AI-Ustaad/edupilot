export const dynamic = 'force-dynamic';
import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId }: TenantContext) => {
        const id = new URL(req.url).pathname.split("/").pop() || "";
        const body = await req.json();
        await adminDb.collection("books").doc(id).update({
          ...body,
          updatedAt: new Date(),
        });
        return createSuccessResponse({ success: true });
      })
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const id = new URL(req.url).pathname.split("/").pop() || "";
        await adminDb.collection("books").doc(id).delete();
        return createSuccessResponse({ success: true });
      })
    )
  )
);
