import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { message } = await req.json();
      if (!message) return createApiResponse(400, null, "Message is required");

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) return createApiResponse(500, null, "AI not configured");

      // سسٹم پرامپٹ: اسسٹنٹ کو اسکول کے بارے میں بتائیں
      const systemPrompt = `You are EduPilot AI, a helpful assistant for a school management system.
You can answer questions about education, provide teaching tips, help with lesson planning, explain concepts, etc.
Respond in a friendly, professional tone. Keep answers concise.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: systemPrompt + "\n\nUser: " + message }] }
            ],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return createApiResponse(500, null, "AI failed to respond");

      return createApiResponse(200, { reply: text });
    })
  )
);
