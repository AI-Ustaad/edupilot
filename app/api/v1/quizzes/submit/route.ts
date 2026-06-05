export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const { quizId, studentId, studentName, answers } = await req.json();
      if (!quizId || !studentId || !answers || !Array.isArray(answers)) {
        return createApiResponse(400, null, "Missing required fields");
      }

      // کوئز لوڈ کریں
      const quizDoc = await adminDb.collection("quizzes").doc(quizId).get();
      if (!quizDoc.exists) {
        return createApiResponse(404, null, "Quiz not found");
      }
      const quiz = quizDoc.data();
      const questions = quiz?.questions || [];

      // خودکار گریڈنگ
      let correct = 0;
      const gradedAnswers = answers.map((ans: any, idx: number) => {
        const question = questions[idx];
        const isCorrect = question && question.correct === ans.selected;
        if (isCorrect) correct++;
        return { ...ans, correct: isCorrect };
      });

      const total = questions.length;
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      const ref = await adminDb.collection("quiz_submissions").add({
        quizId,
        studentId,
        studentName: studentName || "Unknown",
        answers: gradedAnswers,
        correct,
        total,
        percentage,
        submittedBy: user.uid,
        tenantId,
        createdAt: new Date(),
      });

      return createApiResponse(201, {
        id: ref.id,
        correct,
        total,
        percentage,
      });
    })
  )
);
