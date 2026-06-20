export const dynamic = 'force-dynamic';
import { withErrorHandler } from "@/route-helpers";
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { adminDb } from "@/lib/firebase-admin";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export const GET = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.lessonPlans.view,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      if (!tenantId) return errorResponse("Tenant not found", 401);

      const snapshot = await adminDb
        .collection("lessonPlans")
        .where("tenantId", "==", tenantId)
        .orderBy("date", "desc")
        .get();

      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return successResponse(plans, "Lesson plans fetched successfully");
    }
  )
);

export const POST = withErrorHandler(
  withAuthAndPermission(
    PERMISSIONS.lessonPlans.create,
    async (req: Request, context: any) => {
      const tenantId = context.user.tenantId;
      if (!tenantId) return errorResponse("Tenant not found", 401);

      const body = await req.json();
      const { date, topic, objective, materials, notes } = body;

      if (!date || !topic || !objective) {
        return errorResponse("Date, topic, and objective are required", 400);
      }

      const doc = await adminDb.collection("lessonPlans").add({
        tenantId,
        date,
        topic,
        objective,
        materials: materials || "",
        notes: notes || "",
        createdBy: context.user.uid,
        createdAt: new Date(),
      });

      return successResponse({ id: doc.id, ...body }, "Lesson plan created", 201);
    }
  )
);
