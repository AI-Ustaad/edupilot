import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { studentName, marks } = await req.json();
      if (!studentName || !marks || !Array.isArray(marks)) {
        return createApiResponse(400, null, "Missing student data");
      }

      const marksSummary = marks
        .map(m => `${m.subject}: ${m.marksObtained}/${m.totalMarks} (${m.percentage}%, Grade ${m.grade})`)
        .join("\n");

      const prompt = `You are a teacher writing a report card comment for ${studentName}. Here are their subject-wise marks:\n${marksSummary}\n\nWrite a concise, encouraging, and personalized comment (2-3 sentences) for the student, mentioning strengths and areas to improve. Return ONLY the comment, no extra text.`;

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) return createApiResponse(500, null, "AI not configured");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return createApiResponse(500, null, "AI failed to respond");

      return createApiResponse(200, { comment: text.trim() });
    })
  )
);
