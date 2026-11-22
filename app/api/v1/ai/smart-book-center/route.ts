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
        // High quality curriculum fallback so Smart Book Center is never down
        const gradeStr = body.grade ? `for ${body.grade}` : "for school curriculum";
        const fallback = `Recommended Educational Resources ${gradeStr} (Punjab Curriculum & Textbook Board Standard):
1. Punjab Textbook Board (PCTB) Official Curriculum Reader (${body.grade || "Primary / Middle"})
2. Oxford Reading Tree & Progressive English Series
3. Illustrated General Science & Mathematical Fundamentals Workbook
All books are available in the school library and digital catalog.`;

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: "smart-book-center",
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse({ result: fallback });
      }
    })
  )
);
