export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      // AI Quota & Burst Rate Limit Guard
      const quotaCheck = await enforceAiQuota(user, "smart-book-center");
      if (!quotaCheck.allowed) {
        return createAiErrorResponse(quotaCheck);
      }

      const body = await req.json().catch(() => ({}));
      if (!body.query) return createErrorResponse(400, "Query is required");

      const startTime = Date.now();
      try {
        const result = await agentRegistry.execute("teacher", {
          tenantId,
          userId: user.uid,
          userRole: user.role,
          query: `You are an AI librarian and educational resource expert. Help find learning materials. Query: ${body.query}, Grade: ${body.grade || "N/A"}, Type: ${body.type || "general"}`,
        });

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "smart-book-center",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse({ result });
      } catch (err: any) {
        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "smart-book-center",
          latencyMs: Date.now() - startTime,
          success: false,
          error: err.message,
        });

        return createErrorResponse(500, "Smart Book Center AI is temporarily unavailable.");
      }
    })
  )
);
