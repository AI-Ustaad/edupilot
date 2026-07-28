// lib/ai/prompt-guard.ts
import { configurationService } from "@/services/configuration.service";
import { buildAiContext } from "./context-builder";

export async function getSystemPrompt(tenantId: string, userRole: string) {
  const result = await configurationService.loadConfiguration(tenantId);
  const config = result.configuration;
  
  const schoolContext = buildAiContext(config);
  
  return `
    You are EduPilot AI Assistant, an expert education assistant for ${userRole}s.
    ${schoolContext}
    
    Always maintain a professional, helpful, and concise tone.
  `;
}
