// lib/ai/agents/AgentRegistry.ts
import { IAgentStrategy, AgentContext } from "@/lib/ai/strategies/IAgentStrategy";
import { PrincipalAgent } from "@/lib/ai/strategies/PrincipalAgent";
import { TeacherAgent } from "@/lib/ai/strategies/TeacherAgent";
import { StudentAgent } from "@/lib/ai/strategies/StudentAgent";
import { ParentAgent } from "@/lib/ai/strategies/ParentAgent";
import { FinanceAgent } from "@/lib/ai/strategies/FinanceAgent";
import { AdmissionAgent } from "@/lib/ai/strategies/AdmissionAgent";
import { HRAgent } from "@/lib/ai/strategies/HRAgent";
import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import { UsageTracker } from "@/lib/ai/monitoring/UsageTracker";

export class AgentNotFoundError extends Error {
  constructor(agentType: string) {
    super(`No agent registered for type: ${agentType}`);
    this.name = "AgentNotFoundError";
  }
}

export class AgentRegistry {
  private agents: Map<string, IAgentStrategy>;
  private provider: GeminiProvider;
  private usageTracker: UsageTracker;

  constructor() {
    this.agents = new Map();
    this.provider = new GeminiProvider();
    this.usageTracker = new UsageTracker();
    this.registerAll();
  }

  private registerAll(): void {
    const strategies: IAgentStrategy[] = [
      new PrincipalAgent(),
      new TeacherAgent(),
      new StudentAgent(),
      new ParentAgent(),
      new FinanceAgent(),
      new AdmissionAgent(),
      new HRAgent(),
    ];

    for (const strategy of strategies) {
      this.agents.set(strategy.name, strategy);
    }
  }

  getAgent(agentType: string): IAgentStrategy {
    const agent = this.agents.get(agentType);
    if (!agent) throw new AgentNotFoundError(agentType);
    return agent;
  }

  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  async execute(agentType: string, context: AgentContext): Promise<string> {
    const agent = this.getAgent(agentType);
    const startTime = Date.now();
    let success = false;
    let tokensUsed = 0;

    try {
      const systemPrompt = agent.buildSystemPrompt(context);
      const userPrompt = agent.buildUserPrompt(context);

      const response = await this.provider.generateContent(userPrompt, systemPrompt);

      success = true;
      tokensUsed = response.tokensUsed ?? 0;

      return response.text;
    } finally {
      await this.usageTracker.track({
        tenantId: context.tenantId,
        userId: context.userId,
        provider: this.provider.name,
        model: this.provider.getConfig().model,
        tokens: tokensUsed,
        latencyMs: Date.now() - startTime,
        success,
        documentType: `agent:${agentType}`,
      });
    }
  }
}

export const agentRegistry = new AgentRegistry();
