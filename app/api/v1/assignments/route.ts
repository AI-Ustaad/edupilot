export const dynamic = 'force-dynamic';
import { withAuthAndPermission } from "@/route-helpers/withAuthAndPermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { adminDb } from "@/lib/firebase-admin";
import { successResponse, errorResponse } from "@/lib/utils/api-response";

export const GET = withAuthAndPermission(
  PERMISSIONS.assignments.view,
  async (req: Request, context: any) => {
    const tenantId = context.user.tenantId;
    if (!tenantId) return errorResponse("Tenant not found", 401);

    const snapshot = await adminDb
      .collection("assignments")
      .where("tenantId", "==", tenantId)
      .orderBy("createdAt", "desc")
      .get();

    const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return successResponse(assignments, "Assignments fetched successfully");
  }
);

export const POST = withAuthAndPermission(
  PERMISSIONS.assignments.create,
  async (req: Request, context: any) => {
    const tenantId = context.user.tenantId;
    if (!tenantId) return errorResponse("Tenant not found", 401);

    const body = await req.json();
    const { title, description, classGrade, section, subject, dueDate } = body;

    if (!title || !classGrade || !section || !subject) {
      return errorResponse("Missing required fields", 400);
    }

    const doc = await adminDb.collection("assignments").add({
      tenantId,
      title,
      description: description || "",
      classGrade,
      section,
      subject,
      dueDate: dueDate || null,
      createdBy: context.user.uid,
      createdAt: new Date(),
    });

    const newAssignment = { id: doc.id, ...body };
    return successResponse(newAssignment, "Assignment created successfully", 201);
  }
);
