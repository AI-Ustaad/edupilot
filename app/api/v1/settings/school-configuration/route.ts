export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { ConfigurationService } from "@/services/configuration.service";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { createSuccessResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

const configService = new ConfigurationService();
const configRepo = new ConfigurationRepository(); // GET کے لیے

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      // 🟢 موجودہ (Active) کنفیگریشن منگوائیں
      const configuration = await configRepo.getActiveConfiguration(tenantId);
      return createSuccessResponse({ configuration });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    async (req: Request, context: any) => {
      const user = context.user;
      const tenantId = user.tenantId || `tenant_${user.uid}`;
      const body = await req.json();
      
      const { action, payload, reason } = body;

      // 🟢 صرف Publish کرنا ہو (پہلے سے موجود Draft کو)
      if (action === "publish") {
        await configService.publishConfiguration(tenantId, user.uid);
        return createSuccessResponse(null, { message: "Configuration Published Successfully" });
      }

      // 🟢 Edit Flow: نیا ڈرافٹ بنائیں اور فوراً پبلش کر دیں (Save & Publish)
      if (action === "save_and_publish") {
        const draft = await configService.saveDraft(tenantId, user.uid, payload, reason || "Configuration Upgraded");
        await configService.publishConfiguration(tenantId, user.uid);
        return createSuccessResponse(draft, { message: "Configuration Upgraded and Published!" });
      }

      // Default: صرف Draft سیو کریں
      const newConfig = await configService.saveDraft(tenantId, user.uid, payload, reason || "Configuration Draft Saved");
      return createSuccessResponse(newConfig, { message: "Draft Saved" });
    }
  )
);
