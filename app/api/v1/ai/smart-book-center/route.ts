export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";
import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import { UsageTracker } from "@/lib/ai/monitoring/UsageTracker";

const provider = new GeminiProvider();
const usageTracker = new UsageTracker();

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const body = await req.json();
      if (!body.query) return createErrorResponse(400, "Query is required");

      const systemPrompt = `You are an AI librarian and educational resource expert. Help users find appropriate learning materials, books, and resources based on their needs.`;
      const userPrompt = `Query: ${body.query}, Grade: ${body.grade || "N/A"}, Type: ${body.type || "general"}`;

      const startTime = Date.now();
      try {
        const response = await provider.generateContent(userPrompt, systemPrompt);
        await usageTracker.track({
          tenantId,
          userId: user.uid,
          provider: provider.name,
          model: provider.getConfig().model,
          tokens: response.tokensUsed ?? 0,
          latencyMs: Date.now() - startTime,
          success: true,
          documentType: "smart-book-center",
        });
        return createSuccessResponse({ result: response.text });
      } catch (error) {
        await usageTracker.track({
          tenantId,
          userId: user.uid,
          provider: provider.name,
          model: provider.getConfig().model,
          tokens: 0,
          latencyMs: Date.now() - startTime,
          success: false,
          documentType: "smart-book-center",
        });
        throw error;
      }
    })
  )
);
