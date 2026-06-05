export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { bookTitle, chapters, classGrade, subject, questionTypes, totalMarks } = await req.json();
        if (!bookTitle || !chapters || !classGrade || !subject || !questionTypes) {
          return createApiResponse(400, null, "Missing required fields");
        }

        // سوالات کی اقسام کی بنیاد پر پرامپٹ بنائیں
        let prompt = `Generate an exam paper for ${classGrade} students, subject "${subject}", covering the following chapters from the book "${bookTitle}": ${chapters.join(", ")}.\n`;
        prompt += `Include the following question types with their mark distribution: ${JSON.stringify(questionTypes)}.\n`;
        prompt += `Total marks should be ${totalMarks || 100}.\n`;
        prompt += `Return ONLY a valid JSON object with keys: title, instructions, questions (array of objects with: type (mcq/short/long), question, options (for mcq only), marks, modelAnswer (for short/long)). No other text.`;

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) return createApiResponse(500, null, "AI not configured");

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 2500 },
            }),
          }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return createApiResponse(500, null, "AI failed to respond");

        let examPaper;
        try {
          examPaper = JSON.parse(text.replace(/```json|```/g, "").trim());
        } catch (e) {
          return createApiResponse(500, null, "Failed to parse AI response");
        }

        return createApiResponse(200, examPaper);
      })
    )
  )
);