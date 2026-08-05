export interface IAIService {
  executeAgent(agentType: string, context: {
    tenantId: string;
    userId: string;
    userRole: string;
    query: string;
  }): Promise<string>;
  listAgents(): Promise<string[]>;
}
