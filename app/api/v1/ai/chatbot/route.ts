export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { question } = await req.json();
      if (!question) return createErrorResponse(400, "Question is required");

      const answer = await agentRegistry.execute("teacher", {
        tenantId,
        userId: user.uid,
        userRole: user.role,
        query: question,
      });

      return createSuccessResponse({ answer });
    })
  )
);
