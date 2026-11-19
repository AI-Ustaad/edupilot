// lib/ai/strategies/IAgentStrategy.ts

export interface AgentContext {
  tenantId: string;
  userId: string;
  userRole: string;
  query: string;
  tenantSnapshot?: string;
}

export interface IAgentStrategy {
  readonly name: string;
  buildSystemPrompt(context: AgentContext): string;
  buildUserPrompt(context: AgentContext): string;
  getTemperature(): number;
}
