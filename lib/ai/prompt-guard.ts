// lib/ai/prompt-guard.ts (Conceptual Update)
import { buildAiContext } from "./context-builder";
import { configurationRepository } from "@/repositories/configuration.repository";

export async function getSystemPrompt(tenantId: string, userRole: string) {
  // Fetch config from DB
  const config = await configurationRepository.getActiveConfiguration(tenantId);
  
  // Build AI Context
  const schoolContext = buildAiContext(config);
  
  return `
    You are EduPilot AI Assistant, an expert education assistant for ${userRole}s.
    ${schoolContext}
    
    Always maintain a professional, helpful, and concise tone.
  `;
}
