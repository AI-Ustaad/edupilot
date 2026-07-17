export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry } from "@/lib/ai/agents/AgentRegistry";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const body = await req.json();
      if (!body.query) return createErrorResponse(400, "Query is required");

      const result = await agentRegistry.execute("teacher", {
        tenantId,
        userId: user.uid,
        userRole: user.role,
        query: `You are an AI librarian and educational resource expert. Help find learning materials. Query: ${body.query}, Grade: ${body.grade || "N/A"}, Type: ${body.type || "general"}`,
      });

      return createSuccessResponse({ result });
    })
  )
);
