// lib/ai/strategies/FinanceAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class FinanceAgent implements IAgentStrategy {
  readonly name = "finance";

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Finance Agent for EduPilot, an AI assistant for school financial management.
You help with fee tracking, budget analysis, financial reporting, and revenue optimization.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}
Be precise, data-driven, and focus on financial accuracy and actionable insights.`;
  }

  buildUserPrompt(context: AgentContext): string {
    return `Finance Query: ${context.query}

Provide:
1. Financial analysis or explanation
2. Key metrics and trends
3. Recommendations for financial optimization
4. Compliance and reporting considerations`;
  }

  getTemperature(): number {
    return 0.2;
  }
}
