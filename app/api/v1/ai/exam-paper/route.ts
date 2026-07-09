export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { GeminiProvider } from "@/lib/ai/providers/GeminiProvider";
import type { TenantContext } from "@/types/api";

const provider = new GeminiProvider();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { bookTitle, chapters, classGrade, subject, questionTypes, totalMarks } = await req.json();
        if (!bookTitle || !chapters || !classGrade || !subject || !questionTypes) {
          return createErrorResponse(400, "Missing required fields");
        }

        let prompt = `Generate an exam paper for ${classGrade} students, subject "${subject}", covering the following chapters from the book "${bookTitle}": ${chapters.join(", ")}.\n`;
        prompt += `Include the following question types with their mark distribution: ${JSON.stringify(questionTypes)}.\n`;
        prompt += `Total marks should be ${totalMarks || 100}.\n`;
        prompt += `Return ONLY a valid JSON object with keys: title, instructions, questions (array of objects with: type (mcq/short/long), question, options (for mcq only), marks, modelAnswer (for short/long)). No other text.`;

        const response = await provider.generateContent(prompt);
        const text = response.text;
        if (!text) return createErrorResponse(500, "AI failed to respond");

        let examPaper;
        try {
          examPaper = JSON.parse(text.replace(/```json|```/g, "").trim());
        } catch (e) {
          return createErrorResponse(500, "Failed to parse AI response");
        }

        return createSuccessResponse(examPaper);
      })
    )
  )
);