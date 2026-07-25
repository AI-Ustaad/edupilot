export const dynamic = "force-dynamic";

import { withAuthAndPermission } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { StaffService } from "@/services/StaffService";
import { PERMISSIONS } from "@/lib/auth/permissions";

export const GET = withAuthAndPermission(PERMISSIONS.staff.view, async (req, context) => {
  const tenantId = context.user.tenantId;
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop() || "";

  if (!id) {
    return createErrorResponse(400, "Staff ID is required");
  }

  const service = new StaffService();
  const staff = await service.getById(tenantId, id);
  return createSuccessResponse(staff);
});

export const PUT = withAuthAndPermission(PERMISSIONS.staff.update, async (req, context) => {
  const tenantId = context.user.tenantId;
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop() || "";

  if (!id) {
    return createErrorResponse(400, "Staff ID is required");
  }

  const body = await req.json();
  const service = new StaffService();
  await service.update(tenantId, id, body, context.user.uid);
  return createSuccessResponse(null, { message: "Staff updated successfully" });
});

export const DELETE = withAuthAndPermission(PERMISSIONS.staff.delete, async (req, context) => {
  const tenantId = context.user.tenantId;
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop() || "";

  if (!id) {
    return createErrorResponse(400, "Staff ID is required");
  }

  const service = new StaffService();
  await service.delete(tenantId, id, context.user.uid);
  return createSuccessResponse(null, { message: "Staff deleted successfully" });
});
