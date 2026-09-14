export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry, AgentNotFoundError } from "@/lib/ai/agents/AgentRegistry";
import { ROLE_PERMISSIONS, Role } from "@/lib/auth/roles";
import type { TenantContext } from "@/types/api";

export const AGENT_REQUIRED_PERMISSIONS: Record<string, string> = {
  teacher: "ai.view",
  finance: "finance.view",
  principal: "dashboard.view",
  hr: "staff.view",
  admission: "admissions",
  parent: "parents.view",
  student: "students.view",
};

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { agentType, query } = await req.json();
      if (!agentType) return createErrorResponse(400, "Agent type is required");
      if (!query) return createErrorResponse(400, "Query is required");

      const availableAgents = agentRegistry.listAgents();
      if (!availableAgents.includes(agentType)) {
        return createErrorResponse(400, `No agent registered for type: ${agentType}`);
      }

      const requiredPermission = AGENT_REQUIRED_PERMISSIONS[agentType];
      if (requiredPermission) {
        const userRole = (user?.role || "") as Role;
        const userPermissions = ROLE_PERMISSIONS[userRole] || [];
        if (!userPermissions.includes(requiredPermission)) {
          return createErrorResponse(
            403,
            `Forbidden: You lack the '${requiredPermission}' permission required for the '${agentType}' agent.`
          );
        }
      }

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
