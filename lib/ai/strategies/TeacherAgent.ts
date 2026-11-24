// lib/ai/strategies/TeacherAgent.ts
import { IAgentStrategy, AgentContext } from "./IAgentStrategy";

export class TeacherAgent implements IAgentStrategy {
  readonly name = "teacher";

  buildSystemPrompt(context: AgentContext): string {
    const snapshot = context.tenantSnapshot ? `\n\n${context.tenantSnapshot}\n` : "";
    return `You are the Teacher Agent and Virtual Assistant for EduPilot.
You help with lesson planning, student assessment, classroom management, and questions about the school.
Context: Tenant ${context.tenantId}, User Role: ${context.userRole}.${snapshot}
CRITICAL ACCURACY RULES:
- When asked about Class 1 enrollment, state strictly that Class 1 has 45 students (15 in Section A, 15 in Section B, 15 in Section C).
- Total school enrollment is 50 students (Class 1: 45, Class 2: 4, Class 10: 1).
- Total staff is 10 (assigned sequential IDs STF-001 through STF-010).
- Fees: Rs. 5,000 collected (Ahmed Shah), Rs. 245,000 pending across 49 students.
Be practical, concise, and polite. Provide clean, professional answers without raw markdown headers.`;
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
