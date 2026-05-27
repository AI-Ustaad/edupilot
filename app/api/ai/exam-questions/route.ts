import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { className, subject, topic, difficulty } = await req.json();

      if (!className || !subject || !topic || !difficulty) {
        return createApiResponse(400, null, "Missing required fields");
      }

      const prompt = `Generate 5 multiple-choice questions (MCQs), 2 short answer questions, and 1 long answer question for a ${className} class in subject "${subject}" on the topic "${topic}" at difficulty level "${difficulty}".
Return the result as a valid JSON object with this structure:
{
  "mcqs": [{ "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "correct": "A" }],
  "shortAnswers": [{ "question": "...", "modelAnswer": "..." }],
  "longAnswer": { "question": "...", "modelAnswer": "..." }
}
Only return the JSON, no other text.`;

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) return createApiResponse(500, null, "AI not configured");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return createApiResponse(500, null, "AI failed to respond");

      let exam;
      try {
        exam = JSON.parse(text.replace(/```json|```/g, "").trim());
      } catch (e) {
        return createApiResponse(500, null, "Failed to parse AI response");
      }

      return createApiResponse(200, exam);
    })
  )
);
