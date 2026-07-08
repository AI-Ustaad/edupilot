export const dynamic = "force-dynamic";

import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StaffService } from "@/services/StaffService";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface Context {
  tenantId: string;
  user: {
    uid: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

function getIdFromUrl(req: Request): string {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(
        async (req: Request, { tenantId }: Context) => {
          const id = getIdFromUrl(req);
          const service = new StaffService();
          const staff = await service.getById(tenantId, id);
          return createApiResponse(200, staff);
        }
      )
    )
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.update)(
        async (req: Request, { tenantId, user }: Context) => {
          const id = getIdFromUrl(req);
          const body = await req.json();
          const service = new StaffService();
          await service.update(tenantId, id, body, user.uid);
          return createApiResponse(200, null, "Staff updated successfully");
        }
      )
    )
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.delete)(
        async (req: Request, { tenantId, user }: Context) => {
          const id = getIdFromUrl(req);
          const service = new StaffService();
          await service.delete(tenantId, id, user.uid);
          return createApiResponse(200, null, "Staff deleted successfully");
        }
      )
    )
  )
);

