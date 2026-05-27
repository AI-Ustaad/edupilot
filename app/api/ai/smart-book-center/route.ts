import { adminDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { classGrade, section, subject, chapter, bookId, type, dueDate } = await req.json();
        if (!classGrade || !section || !subject || !chapter || !type) {
          return createApiResponse(400, null, "Missing required fields");
        }

        // کتاب سے اضافی متن حاصل کریں (اگر موجود ہو)
        let bookContext = "";
        if (bookId) {
          const bookDoc = await adminDb.collection("books").doc(bookId).get();
          if (bookDoc.exists) {
            const bookData = bookDoc.data();
            const chapterData = bookData?.chapters?.find((c: any) => c.title === chapter);
            if (chapterData?.contentText) {
              bookContext = chapterData.contentText.substring(0, 3000); // 3000 حروف تک محدود
            }
          }
        }

        // AI پرامپٹ تیار کریں
        let prompt = "";
        if (type === "quiz") {
          prompt = `Based on the following chapter content (if provided), generate 10 multiple-choice questions (MCQs) for ${classGrade} students, subject "${subject}", chapter "${chapter}".\n${bookContext ? "Content:\n" + bookContext + "\n" : ""}\nFor each question provide: question, 4 options (A, B, C, D), and correct option letter. Return ONLY a valid JSON array of objects with keys: question, options (array), correct. No other text.`;
        } else if (type === "test") {
          prompt = `Based on the following chapter content (if provided), generate a test for ${classGrade} students, subject "${subject}", chapter "${chapter}".\n${bookContext ? "Content:\n" + bookContext + "\n" : ""}\nInclude: 5 MCQs (each with question, 4 options, correct), 2 short answer questions (with model answer), and 1 long answer question (with model answer). Return ONLY a valid JSON object with keys: mcqs (array), shortAnswers (array of {question, modelAnswer}), longAnswer ({question, modelAnswer}). No other text.`;
        } else if (type === "lesson_plan") {
          prompt = `Based on the following chapter content (if provided), create a detailed 40-minute lesson plan for ${classGrade} students, subject "${subject}", chapter "${chapter}".\n${bookContext ? "Content:\n" + bookContext + "\n" : ""}\nInclude: Learning Objectives, Materials Needed, Introduction (5 min), Main Activity (20 min), Practice Exercise (10 min), Conclusion (5 min). Return ONLY a valid JSON object with these keys. No other text.`;
        } else if (type === "homework") {
          prompt = `Based on the following chapter content (if provided), create a homework assignment for ${classGrade} students, subject "${subject}", chapter "${chapter}".\n${bookContext ? "Content:\n" + bookContext + "\n" : ""}\nInclude: title, description (2-3 sentences), and a list of 3 tasks. Return ONLY a valid JSON object with keys: title, description, tasks (array of strings). No other text.`;
        } else {
          return createApiResponse(400, null, "Invalid type.");
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) return createApiResponse(500, null, "AI not configured");

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
            }),
          }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return createApiResponse(500, null, "AI failed to respond");

        let generatedContent;
        try {
          generatedContent = JSON.parse(text.replace(/```json|```/g, "").trim());
        } catch (e) {
          return createApiResponse(500, null, "Failed to parse AI response");
        }

        // مواد کو متعلقہ کلیکشن میں محفوظ کریں
        let contentRef;
        const baseTitle = `${subject} - ${chapter}`;
        const dueDateObj = dueDate ? new Date(dueDate) : null;

        if (type === "quiz" || type === "test") {
          const questionsArray = type === "quiz" ? generatedContent : generatedContent.mcqs;
          contentRef = await adminDb.collection("quizzes").add({
            title: `${baseTitle} ${type === "quiz" ? "Quiz" : "Test"}`,
            classGrade,
            section,
            subject,
            chapter,
            questions: questionsArray,
            dueDate: dueDateObj,
            createdBy: user.uid,
            tenantId,
            createdAt: new Date(),
          });
        } else if (type === "lesson_plan") {
          contentRef = await adminDb.collection("lesson_plans").add({
            date: new Date().toISOString().slice(0, 10),
            topic: chapter,
            subject,
            classGrade,
            section,
            ...generatedContent,
            createdBy: user.uid,
            tenantId,
            createdAt: new Date(),
          });
        } else if (type === "homework") {
          contentRef = await adminDb.collection("homework").add({
            title: generatedContent.title || baseTitle,
            description: generatedContent.description || "",
            tasks: generatedContent.tasks || [],
            classGrade,
            section,
            subject,
            chapter,
            dueDate: dueDateObj,
            createdBy: user.uid,
            tenantId,
            createdAt: new Date(),
          });
        } else if (type === "assignment") {
          contentRef = await adminDb.collection("assignments").add({
            title: baseTitle,
            description: generatedContent?.description || "",
            classGrade,
            section,
            subject,
            dueDate: dueDateObj,
            createdBy: user.uid,
            tenantId,
            createdAt: new Date(),
          });
        }

        // طلبہ کی فہرست اور والدین کو ای میل
        const studentsSnap = await adminDb
          .collection("students")
          .where("tenantId", "==", tenantId)
          .where("classGrade", "==", classGrade)
          .where("section", "==", section)
          .get();

        const parentEmails: { email: string; studentName: string }[] = [];
        studentsSnap.forEach(doc => {
          const s = doc.data();
          const email = s.parentEmail || s.email;
          if (email) parentEmails.push({ email, studentName: s.fullName || s.name || "Student" });
        });

        const dueStr = dueDateObj ? ` Due Date: ${dueDateObj.toLocaleDateString()}.` : "";
        for (const p of parentEmails) {
          sendEmail(
            p.email,
            `New ${type} assigned for ${p.studentName}`,
            `<p>Dear Parent,</p><p>${baseTitle} has been assigned to your child.${dueStr} Please check the parent dashboard.</p>`
          ).catch(console.error);
        }

        return createApiResponse(200, {
          id: contentRef.id,
          type,
          studentsNotified: parentEmails.length,
        });
      })
    )
  )
);
