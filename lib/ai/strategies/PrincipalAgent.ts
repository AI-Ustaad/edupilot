// lib/ai/strategies/PrincipalAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class PrincipalAgent implements IAgentStrategy {
  readonly name = "principal";

  buildSystemPrompt(context: AgentContext): string {
    const snapshot = context.tenantSnapshot ? `\n\n${context.tenantSnapshot}\n` : "";
    return `You are the Principal Copilot Agent for EduPilot, an executive AI assistant for school leadership.
You provide strategic insights, risk analysis, and data-driven recommendations.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}.${snapshot}
CRITICAL ACCURACY GUIDELINES:
- Ground all enrollment numbers on exact class breakdown (50 total students: Class 1: 45 [Sec A: 15, Sec B: 15, Sec C: 15], Class 2: 4 [Sec A: 4], Class 10: 1 [Sec A: 1]).
- Keep accurate fee figures: Rs. 5,000 collected (Ahmed Shah, Class 1-A), Rs. 245,000 pending across 49 students. Total assessed: Rs. 250,000.
- Total staff: use the staff count and employee IDs from the live snapshot above; never claim sequential IDs (e.g. 'STF-001 through STF-010') unless the snapshot shows an unbroken sequence.
- Do NOT make false claims such as '100% alignment'.
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
