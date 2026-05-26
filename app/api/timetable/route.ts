import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { classes, days, periods, subjects, teachers } = await req.json();
        const prompt = `
          Generate a weekly school timetable in JSON format for:
          Classes: ${classes.join(", ")}
          Days: ${days.join(", ")} (e.g., Monday-Friday)
          Periods per day: ${periods}
          Subjects: ${subjects.join(", ")}
          Teachers: ${teachers.join(", ")}
          Each entry should have: day, period, subject, class, teacher.
          Return ONLY valid JSON array, no extra text.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        let timetable = [];
        try {
          timetable = JSON.parse(text.replace(/```json|```/g, "").trim());
        } catch (e) {
          return createApiResponse(500, null, "Failed to parse AI response");
        }

        // Save to Firestore if needed
        return createApiResponse(200, timetable);
      })
    )
  )
);
