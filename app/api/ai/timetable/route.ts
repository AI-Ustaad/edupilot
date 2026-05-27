import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { classes, days, periods, subjects, teachers } = await req.json();

        if (!classes || !days || !periods || !subjects || !teachers) {
          return createApiResponse(400, null, "Missing required fields");
        }

        const prompt = `
          Generate a valid JSON array representing a weekly school timetable. Do not include any other text, explanation, or markdown formatting such as \`\`\`json.

          Requirements:
          - Classes: ${classes.join(", ")}
          - Days: ${days.join(", ")}
          - Periods per day: ${periods}
          - Subjects: ${subjects.join(", ")}
          - Teachers: ${teachers.join(", ")}

          Each entry must have exactly these keys: "day", "period", "subject", "class", "teacher".
          The period should be a number (e.g., 1, 2, 3...).
          Ensure the JSON is valid and complete. Return ONLY the JSON array.
        `;

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
          return createApiResponse(500, null, "Gemini API key not configured");
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2048,
              },
            }),
          }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          console.error("No text in Gemini response:", data);
          return createApiResponse(500, null, "No response from AI");
        }

        let timetable;
        try {
          // Clean potential markdown artifacts
          const cleanedText = text.replace(/```json|```/g, "").trim();
          timetable = JSON.parse(cleanedText);
        } catch (e) {
          console.error("JSON parse error:", text);
          return createApiResponse(500, null, "Failed to parse AI response. Raw: " + text.substring(0, 100));
        }

        if (!Array.isArray(timetable) || timetable.length === 0) {
          return createApiResponse(500, null, "AI returned empty or invalid timetable");
        }

        // Optionally save to Firestore (future use)
        // for (const entry of timetable) {
        //   await adminDb.collection("ai_timetables").add({ ...entry, tenantId, createdAt: new Date() });
        // }

        return createApiResponse(200, timetable);
      })
    )
  )
);
