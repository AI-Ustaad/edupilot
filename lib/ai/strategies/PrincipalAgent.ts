// lib/ai/strategies/PrincipalAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class PrincipalAgent implements IAgentStrategy {
  readonly name = "principal";

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Principal Agent for EduPilot, an executive AI assistant for school principals.
You provide strategic insights, risk analysis, and data-driven recommendations.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}
Be concise, data-driven, and focus on actionable insights for school leadership.`;
  }

  buildUserPrompt(context: AgentContext): string {
    return `Analyze the following school data and provide executive summary, risks, and recommendations.

User Query: ${context.query}

Provide:
1. Executive Summary of the situation
2. Key Risks Identified
3. Actionable Recommendations
4. Key Metrics to Monitor`;
  }

  getTemperature(): number {
    return 0.3;
  }
}
