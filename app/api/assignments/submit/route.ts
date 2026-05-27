import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";
import { getSessionUser } from "@/lib/auth/auth-server";

export const POST = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId, user }: TenantContext) => {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      const assignmentId = formData.get("assignmentId") as string;
      const studentId = formData.get("studentId") as string;
      const studentName = formData.get("studentName") as string;

      if (!file || !assignmentId || !studentId) {
        return createApiResponse(400, null, "Missing required fields");
      }

      // فائل Firebase Storage میں اپ لوڈ کریں
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${tenantId}/submissions/${assignmentId}/${studentId}_${Date.now()}_${file.name}`;
      const bucket = adminStorage.bucket();
      const fileRef = bucket.file(fileName);
      await fileRef.save(buffer, { contentType: file.type });
      await fileRef.makePublic();
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Firestore میں سبمیشن ریکارڈ
      const submissionRef = await adminDb.collection("submissions").add({
        assignmentId,
        studentId,
        studentName: studentName || "Unknown",
        fileUrl,
        fileName: file.name,
        submittedBy: user.uid,
        tenantId,
        createdAt: new Date(),
      });

      return createApiResponse(201, { id: submissionRef.id, fileUrl });
    })
  )
);

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const assignmentId = searchParams.get("assignmentId");
      if (!assignmentId) {
        return createApiResponse(400, null, "assignmentId is required");
      }
      const snapshot = await adminDb
        .collection("submissions")
        .where("assignmentId", "==", assignmentId)
        .where("tenantId", "==", tenantId)
        .orderBy("createdAt", "desc")
        .get();
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return createApiResponse(200, data);
    })
  )
);
