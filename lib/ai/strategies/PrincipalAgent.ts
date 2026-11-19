// lib/ai/strategies/PrincipalAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class PrincipalAgent implements IAgentStrategy {
  readonly name = "principal";

  buildSystemPrompt(context: AgentContext): string {
    const snapshot = context.tenantSnapshot ? `\n\n${context.tenantSnapshot}\n` : "";
    return `You are the Principal Copilot Agent for EduPilot, an executive AI assistant for school leadership.
You provide strategic insights, risk analysis, and data-driven recommendations.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}.${snapshot}
Be concise, data-driven, and focus on actionable insights for school leadership. Reference actual school figures whenever appropriate.`;
  }

  buildUserPrompt(context: AgentContext): string {
    return `Analyze the current school situation and provide executive summary, risks, and recommendations.

User Query: ${context.query}

Provide:
1. Executive Summary of the situation
2. Key Operational & Academic Risks Identified
3. Actionable Recommendations for Administration
4. Key Metrics to Monitor`;
  }

  getTemperature(): number {
    return 0.3;
  }
}
