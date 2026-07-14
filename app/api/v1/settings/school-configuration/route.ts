export const dynamic = "force-dynamic";

import { withAuth, withErrorHandler, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/response";
import { SchoolConfigurationSchema } from "@/lib/validation/school-configuration.schema";
import { schoolConfigurationService } from "@/services/school-configuration.service";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(withAuth(withTenant(withPermission(PERMISSIONS.settings.view)(async (_request: Request, { tenantId }: TenantContext) => {
  const [configuration, history] = await Promise.all([schoolConfigurationService.getConfiguration(tenantId), schoolConfigurationService.getHistory(tenantId)]);
  return createSuccessResponse({ configuration, history });
}))));

export const PUT = withErrorHandler(withAuth(withTenant(withPermission(PERMISSIONS.settings.update)(async (request: Request, { tenantId, user }: TenantContext) => {
  const parsed = SchoolConfigurationSchema.safeParse(await request.json());
  if (!parsed.success) return createErrorResponse(400, "Invalid school configuration", parsed.error.errors);
  const configuration = await schoolConfigurationService.saveConfiguration(parsed.data, tenantId, user.uid);
  return createSuccessResponse(configuration, { message: "School configuration saved" });
}))));
