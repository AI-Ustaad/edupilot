// lib/ai/strategies/HRAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class HRAgent implements IAgentStrategy {
  readonly name = "hr";

  buildSystemPrompt(context: AgentContext): string {
    return `You are the HR Agent for EduPilot, an AI assistant for human resources in schools.
You help with staff management, payroll, leave tracking, recruitment, and performance management.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}
Be professional, policy-aware, and maintain confidentiality in HR matters.`;
  }

  buildUserPrompt(context: AgentContext): string {
    return `HR Query: ${context.query}

Provide:
1. HR process guidance or policy information
2. Staff management recommendations
3. Compliance and record-keeping considerations`;
  }

  getTemperature(): number {
    return 0.3;
  }
}
