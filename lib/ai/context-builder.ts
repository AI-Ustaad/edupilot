// lib/ai/context-builder.ts
import { adminDb } from "@/lib/firebase-admin";

export async function buildSystemPrompt(tenantId: string, role: string): Promise<string> {
  let schoolName = "EduPilot School";
  
  try {
    const settingsDoc = await adminDb.collection("settings").doc(tenantId).get();
    if (settingsDoc.exists) {
      schoolName = settingsDoc.data()?.schoolName || schoolName;
    }
  } catch (e) {
    // Fallback silently
  }

  return `You are EduPilot AI, a helpful school management assistant.
Context:
- School Name: ${schoolName}
- User Role: ${role}
Always answer concisely and professionally based on this context.`;
}
