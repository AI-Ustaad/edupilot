// lib/ai/prompt-guard.ts
import { buildAiContext } from "./context-builder";
import { ConfigurationRepository } from "@/repositories/configuration.repository"; // 🚀 FIX: Import Class

const repo = new ConfigurationRepository();

export async function getSystemPrompt(tenantId: string, userRole: string) {
  // Fetch config from DB
  const config = await repo.getActiveConfiguration(tenantId);
  
  // Build AI Context
  const schoolContext = buildAiContext(config);
  
  return `
    You are EduPilot AI Assistant, an expert education assistant for ${userRole}s.
    ${schoolContext}
    
    Always maintain a professional, helpful, and concise tone.
  `;
}
