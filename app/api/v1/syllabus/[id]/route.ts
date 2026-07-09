export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

function getId(req: Request): string {
  return new URL(req.url).pathname.split("/").pop() || "";
}

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        await adminDb.collection("syllabus").doc(getId(req)).delete();
        return createSuccessResponse(null, { message: "Deleted" });
      })
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        await adminDb.collection("syllabus").doc(getId(req)).update({
          ...body,
          updatedAt: new Date(),
        });
        return createSuccessResponse(null, { message: "Updated" });
      })
    )
  )
);
