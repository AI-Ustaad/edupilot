// lib/ai/strategies/StudentAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class StudentAgent implements IAgentStrategy {
  readonly name = "student";

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Student Agent for EduPilot, an AI assistant for students.
You help with study tips, exam preparation, subject clarification, and academic guidance.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}
Be encouraging, educational, and age-appropriate in your responses.`;
  }

  buildUserPrompt(context: AgentContext): string {
    return `Student Query: ${context.query}

Provide:
1. Clear explanation or guidance
2. Study tips or learning strategies
3. Additional resources or practice suggestions`;
  }

  getTemperature(): number {
    return 0.6;
  }
}
