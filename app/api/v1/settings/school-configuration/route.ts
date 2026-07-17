export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { ConfigurationService } from "@/services/configuration.service";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";

const configService = new ConfigurationService();
const configRepo = new ConfigurationRepository();

// 🟢 GET: اسکول کی کنفیگریشن لانے کے لیے
export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, { tenantId }: TenantContext) => {
      const configuration = await configRepo.getActiveConfiguration(tenantId);
      return createSuccessResponse({ configuration });
    })
  )
);

// 🟢 POST: کنفیگریشن سیو یا پبلش کرنے کے لیے
export const POST = withErrorHandler(
  withAuth(
    async (req: Request, context: any) => {
      const user = context.user;
      const tenantId = user.tenantId || `tenant_${user.uid}`;
      const body = await req.json();
      
      const { action, payload, reason } = body;

      if (action === "publish") {
        await configService.publishConfiguration(tenantId, user.uid);
        return createSuccessResponse(null, { message: "Configuration Published Successfully" });
      }

      if (action === "save_and_publish") {
        const draft = await configService.saveDraft(tenantId, user.uid, payload, reason || "Configuration Upgraded");
        await configService.publishConfiguration(tenantId, user.uid);
        return createSuccessResponse(draft, { message: "Configuration Upgraded and Published!" });
      }

      // Default: Save as Draft
      const newConfig = await configService.saveDraft(tenantId, user.uid, payload, reason || "Configuration Draft Saved");
      return createSuccessResponse(newConfig, { message: "Draft Saved" });
    }
  )
);

// 🔥 PERMANENT FIX: PUT میتھڈ کو بھی POST کی طرح کام کرنے کی ہدایت دیں
export const PUT = POST;
