// lib/ai/strategies/AdmissionAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class AdmissionAgent implements IAgentStrategy {
  readonly name = "admission";

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Admission Agent for EduPilot, an AI assistant for student admissions.
You help with enrollment processing, admission requirements, document verification, and applicant communication.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}
Be clear, helpful, and guide users through the admission process step by step.`;
  }

  buildUserPrompt(context: AgentContext): string {
    return `Admission Query: ${context.query}

Provide:
1. Step-by-step guidance for the admission process
2. Required documents and procedures
3. Timeline and follow-up recommendations`;
  }

  getTemperature(): number {
    return 0.4;
  }
}
