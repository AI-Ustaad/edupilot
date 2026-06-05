export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("id");
      if (!studentId) {
        return createApiResponse(400, null, "Student ID is required");
      }

      const studentDoc = await adminDb.collection("students").doc(studentId).get();
      if (!studentDoc.exists || studentDoc.data()?.tenantId !== tenantId) {
        return createApiResponse(404, null, "Student not found");
      }
      // ✅ as any تاکہ TypeScript خاموش رہے
      const student = { id: studentDoc.id, ...studentDoc.data() } as any;

      // حاضری کا رجحان (پچھلے 6 ماہ)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const attendanceSnap = await adminDb
        .collection("attendance")
        .where("studentId", "==", studentId)
        .where("tenantId", "==", tenantId)
        .where("date", ">=", sixMonthsAgo.toISOString().slice(0, 10))
        .orderBy("date", "asc")
        .get();

      const attendanceByMonth: Record<string, { present: number; total: number }> = {};
      attendanceSnap.forEach(doc => {
        const d = doc.data();
        const month = d.date.substring(0, 7);
        if (!attendanceByMonth[month]) attendanceByMonth[month] = { present: 0, total: 0 };
        attendanceByMonth[month].total++;
        if (d.status === "Present") attendanceByMonth[month].present++;
      });
      const attendanceTrend = Object.entries(attendanceByMonth).map(([month, data]) => ({
        month,
        percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      }));

      // مارکس کا ڈیٹا
      const marksSnap = await adminDb
        .collection("marks")
        .where("studentId", "==", studentId)
        .where("tenantId", "==", tenantId)
        .orderBy("updatedAt", "desc")
        .get();

      const marksList = marksSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      const marksByTerm: Record<string, { totalObt: number; totalMax: number; subjects: number }> = {};
      marksList.forEach(m => {
        if (!marksByTerm[m.term]) marksByTerm[m.term] = { totalObt: 0, totalMax: 0, subjects: 0 };
        marksByTerm[m.term].totalObt += Number(m.marksObtained || 0);
        marksByTerm[m.term].totalMax += Number(m.totalMarks || 0);
        marksByTerm[m.term].subjects++;
      });
      const marksTrend = Object.entries(marksByTerm).map(([term, data]) => ({
        term,
        percentage: data.totalMax > 0 ? Math.round((data.totalObt / data.totalMax) * 100) : 0,
      }));

      // کوئز جمع کرانے کا ڈیٹا
      const quizSubSnap = await adminDb
        .collection("quiz_submissions")
        .where("studentId", "==", studentId)
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
      const quizzes = quizSubSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      // اسائنمنٹ جمع کرانے کا ڈیٹا
      const submissionsSnap = await adminDb
        .collection("submissions")
        .where("studentId", "==", studentId)
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
      const assignments = submissionsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      // AI مشورے
      let aiSuggestions = "";
      if (marksList.length > 0 && attendanceTrend.length > 0) {
        const latestAttendance = attendanceTrend[attendanceTrend.length - 1]?.percentage || 0;
        const latestMarks = marksTrend[marksTrend.length - 1]?.percentage || 0;
        const weakSubjects = marksList.filter(m => (m.marksObtained / m.totalMarks) < 0.5).map(m => m.subject);

        const prompt = `Student ${student.fullName || student.name} has overall attendance ${latestAttendance}% and latest marks average ${latestMarks}%. Weak subjects: ${weakSubjects.join(", ") || "none"}. Provide 2 short, encouraging, personalized suggestions for improvement in Urdu or English. Keep it concise.`;

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (GEMINI_API_KEY) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: { temperature: 0.7, maxOutputTokens: 100 },
                }),
              }
            );
            const data = await response.json();
            aiSuggestions = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          } catch (err) {
            console.error("AI suggestion error:", err);
          }
        }
      }

      return createApiResponse(200, {
        student,
        attendanceTrend,
        marksTrend,
        recentQuizzes: quizzes,
        recentAssignments: assignments,
        aiSuggestions: aiSuggestions.trim(),
      });
    })
  )
);
