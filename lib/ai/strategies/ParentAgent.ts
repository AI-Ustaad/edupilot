// lib/ai/strategies/ParentAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class ParentAgent implements IAgentStrategy {
  readonly name = "parent";

  buildSystemPrompt(context: AgentContext): string {
    return `You are the Parent Agent for EduPilot, an AI assistant for parents.
You help parents understand their child's academic progress, school activities, and ways to support learning at home.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}
Be warm, supportive, and focus on student well-being and academic growth.`;
  }

  buildUserPrompt(context: AgentContext): string {
    return `Parent Query: ${context.query}

Provide:
1. Clear information about the student's progress or situation
2. Suggestions for parental support at home
3. Communication tips for engaging with teachers`;
  }

  getTemperature(): number {
    return 0.4;
  }
}
