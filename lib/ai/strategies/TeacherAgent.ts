// lib/ai/strategies/TeacherAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class TeacherAgent implements IAgentStrategy {
  readonly name = "teacher";

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Teacher Agent for EduPilot, an AI assistant for teachers.
You help with lesson planning, student assessment, classroom management, and teaching resources.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}
Be practical, educational, and supportive. Provide actionable teaching strategies.`;
  }

  buildUserPrompt(context: AgentContext): string {
    return `Teacher Query: ${context.query}

Provide:
1. Practical advice for the teaching scenario
2. Suggested approaches or resources
3. Tips for student engagement and assessment`;
  }

  getTemperature(): number {
    return 0.5;
  }
}
