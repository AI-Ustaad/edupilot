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
      const quotaCheck = await enforceAiQuota(user, "chatbot");
      if (!quotaCheck.allowed) {
        return createAiErrorResponse(quotaCheck);
      }

      const body = await req.json().catch(() => ({}));
      const question = body.question || body.query;
      if (!question) return createErrorResponse(400, "Question is required");

      const startTime = Date.now();
      try {
        const answer = await agentRegistry.execute("teacher", {
          tenantId,
          userId: user.uid,
          userRole: user.role,
          query: question,
        });

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "chatbot",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse({ answer });
      } catch (err: any) {
        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "chatbot",
          latencyMs: Date.now() - startTime,
          success: false,
          error: err.message,
        });

        return createErrorResponse(500, "Chatbot is temporarily unavailable. Please try again later.");
      }
    })
  )
);
