export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { adminDb } from "@/lib/firebase-admin";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export const GET = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.quizzes.view,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      if (!tenantId) return errorResponse("Tenant not found", 401);

      const snapshot = await adminDb
        .collection("quizzes")
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .get();

      const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return successResponse(quizzes, "Quizzes fetched successfully");
    }
  )
);

export const POST = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.quizzes.create,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      if (!tenantId) return errorResponse("Tenant not found", 401);

      const body = await req.json();
      const { title, classGrade, section, subject, dueDate, questions } = body;

      if (!title || !classGrade || !section || !questions || !Array.isArray(questions)) {
        return errorResponse("Missing required fields", 400);
      }

      const doc = await adminDb.collection("quizzes").add({
        tenantId,
        title,
        classGrade,
        section,
        subject: subject || "",
        dueDate: dueDate || null,
        questions,
        createdBy: context.user.uid,
        createdAt: new Date(),
      });

      return successResponse({ id: doc.id, ...body }, "Quiz created successfully", 201);
    }
  )
);
