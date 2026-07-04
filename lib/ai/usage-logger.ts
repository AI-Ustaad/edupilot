// lib/ai/usage-logger.ts
import { adminDb } from "@/lib/firebase-admin";

export async function logAIUsage(params: {
  tenantId: string;
  userId: string;
  route: string;
  model: string;
  tokensUsed: number;
  durationMs: number;
  success: boolean;
}) {
  try {
    await adminDb.collection("ai_usage").add({
      ...params,
      timestamp: new Date(),
    });
  } catch (e) {
    console.error("[AI Usage Logger] Failed to log:", e);
  }
}
