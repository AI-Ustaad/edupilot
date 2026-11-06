export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { agentRegistry, AgentNotFoundError } from "@/lib/ai/agents/AgentRegistry";
import { ROLE_PERMISSIONS, Role } from "@/lib/auth/roles";
import { enforceAiQuota, createAiErrorResponse, recordAiTelemetry } from "@/lib/ai/ai-quota-guard";
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
      const body = await req.json().catch(() => ({}));
      const { agentType } = body;
      const query = body.query || body.context;
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

      // AI Quota & Burst Rate Limit Guard
      const quotaCheck = await enforceAiQuota(user, `agent:${agentType}`);
      if (!quotaCheck.allowed) {
        return createAiErrorResponse(quotaCheck);
      }

      const startTime = Date.now();
      try {
        const result = await agentRegistry.execute(agentType, {
          tenantId,
          userId: user.uid,
          userRole: user.role,
          query,
        });

        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: `agent:${agentType}`,
          latencyMs: Date.now() - startTime,
          success: true,
        });

        return createSuccessResponse({ answer: result });
      } catch (error: any) {
        await recordAiTelemetry({
          tenantId,
          userId: user.uid,
          featureKey: `agent:${agentType}`,
          latencyMs: Date.now() - startTime,
          success: false,
          error: error.message,
        });

        if (error instanceof AgentNotFoundError) {
          return createErrorResponse(400, error.message);
        }
        return createErrorResponse(500, "AI service temporarily unavailable. Please try again later.");
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
