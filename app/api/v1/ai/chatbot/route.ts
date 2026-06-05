export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler, withRateLimit } from "@/route-helpers";
import { aiRateLimit } from "@/lib/ratelimit";
import { ChatbotService } from "@/services/ai/chatbot.service";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withRateLimit(aiRateLimit)(
      withTenant(async (req: Request, { tenantId }: TenantContext) => {
        const { question } = await req.json();
        if (!question) return createApiResponse(400, null, "Question required");

        const service = new ChatbotService();
        const answer = await service.respond(question);
        return createApiResponse(200, { answer });
      })
    )
  )
);
