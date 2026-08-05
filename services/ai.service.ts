import { AgentRegistry } from "@/lib/ai/agents/AgentRegistry";
import { AgentNotFoundError } from "@/lib/ai/agents/AgentRegistry";
import type { IAIService } from "@/interfaces/IAIService";

export class AIService implements IAIService {
  private agentRegistry: AgentRegistry;

  constructor(agentRegistry?: AgentRegistry) {
    this.agentRegistry = agentRegistry ?? new AgentRegistry();
  }

  async executeAgent(agentType: string, context: {
    tenantId: string;
    userId: string;
    userRole: string;
    query: string;
  }): Promise<string> {
    return this.agentRegistry.execute(agentType, context);
  }

  async listAgents(): Promise<string[]> {
    return this.agentRegistry.listAgents();
  }
}

export const aiService = new AIService();
