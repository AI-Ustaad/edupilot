// app/api/v1/curriculum/upgrade/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { versionEngine } from "@/education/engines/version.engine";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { configurationService } from "@/services/configuration.service";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

// 1. Check if upgrade is available
export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      const currentConfig = await configurationService.getConfigurationViewModel(tenantId);
      
      if (!currentConfig) {
        return createErrorResponse(404, "Configuration not found");
      }

      const repo = new ConfigurationRepository();
      const dbConfig = await repo.getConfiguration(tenantId);
      if (!dbConfig) {
        return createErrorResponse(404, "Configuration not found");
      }

      const upgradeStatus = await versionEngine.checkForUpgrades(dbConfig);
      return createSuccessResponse(upgradeStatus);
    })
  )
);

// 2. Apply the upgrade
export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { newVersionId } = await req.json();
      
      const repo = new ConfigurationRepository();
      const currentConfig = await repo.getConfiguration(tenantId);
      
      if (!currentConfig) {
        return createErrorResponse(404, "Configuration not found");
      }

      // Get the upgrade patch from Version Engine
      const upgradePatch = await versionEngine.applyUpgrade(currentConfig, newVersionId);
      
      // Merge patch into current config and save
      const updatedConfig = {
        ...currentConfig,
        ...upgradePatch,
        version: {
          ...currentConfig.version,
          number: currentConfig.version.number + 1,
          reason: `Upgraded to Curriculum Version: ${newVersionId}`,
          publishedAt: new Date().toISOString(),
          publishedBy: user.uid
        }
      };

      await repo.saveConfiguration(tenantId, updatedConfig);

      return createSuccessResponse({ success: true }, { message: "Curriculum upgraded successfully!" });
    })
  )
);
