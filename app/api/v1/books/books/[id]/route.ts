import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
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
        return createApiResponse(200, { success: true });
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
        return createApiResponse(200, { success: true });
      })
    )
  )
);
