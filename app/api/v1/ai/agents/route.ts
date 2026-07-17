export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry, AgentNotFoundError } from "@/lib/ai/agents/AgentRegistry";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { agentType, query } = await req.json();
      if (!agentType) return createErrorResponse(400, "Agent type is required");
      if (!query) return createErrorResponse(400, "Query is required");

      try {
        const result = await agentRegistry.execute(agentType, {
          tenantId,
          userId: user.uid,
          userRole: user.role,
          query,
        });
        return createSuccessResponse({ answer: result });
      } catch (error) {
        if (error instanceof AgentNotFoundError) {
          return createErrorResponse(400, error.message);
        }
        throw error;
      }
    })
  )
);

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (_req: Request, _context: TenantContext) => {
      const agents = agentRegistry.listAgents();
      return createSuccessResponse(agents);
    })
  )
);
