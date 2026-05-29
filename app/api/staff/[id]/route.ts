// app/api/staff/[id]/route.ts
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StaffService } from "@/services/staff.service";
import { StaffRepository } from "@/repositories/staff.repository";
import { logAction } from "@/lib/audit";

interface WithTenantContext {
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
    withTenant(async (req: Request, { tenantId }: WithTenantContext) => {
      const id = getIdFromUrl(req);
      const service = new StaffService(new StaffRepository());
      const staff = await service.getStaffById(id, tenantId);
      if (!staff) {
        return createApiResponse(404, null, "Staff not found");
      }
      return createApiResponse(200, staff);
    })
  )
);

export const PUT = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin") {
        return createApiResponse(403, null, "Forbidden");
      }
      const id = getIdFromUrl(req);
      const body = await req.json();
      const service = new StaffService(new StaffRepository());
      await service.updateStaff(id, body, tenantId, user.uid);
      return createApiResponse(200, null, "Staff updated successfully");
    })
  )
);

export const DELETE = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: WithTenantContext) => {
      if (user.role !== "admin") {
        return createApiResponse(403, null, "Forbidden");
      }
      const id = getIdFromUrl(req);
      const service = new StaffService(new StaffRepository());
      const staff = await service.getStaffById(id, tenantId);
      if (!staff) {
        return createApiResponse(404, null, "Staff not found");
      }
      await service.deleteStaff(id, tenantId);
      await logAction({
        action: "STAFF_DELETED",
        userId: user.uid,
        tenantId,
        entityId: id,
        entityType: "staff",
        metadata: { name: staff.personal?.fullName },
      });
      return createApiResponse(200, null, "Staff deleted successfully");
    })
  )
);
