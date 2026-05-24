import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const doc = await adminDb.collection("whitelabel").doc(tenantId).get();
      return createApiResponse(200, doc.data() || { logo: "", favicon: "", schoolName: "", primaryColor: "#3b82f6" });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const data = await req.json();
        await adminDb.collection("whitelabel").doc(tenantId).set(data, { merge: true });
        return createApiResponse(200, null, "Whitelabel saved");
      })
    )
  )
);
