import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

// ویڈیوز کی فہرست حاصل کریں
export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const classGrade = searchParams.get("classGrade");
      const subject = searchParams.get("subject");

      let query = adminDb.collection("video_lectures").where("tenantId", "==", tenantId);
      if (classGrade) query = query.where("classGrade", "==", classGrade);
      if (subject) query = query.where("subject", "==", subject);
      query = query.orderBy("createdAt", "desc").limit(50);

      const snapshot = await query.get();
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      return createApiResponse(200, data);
    })
  )
);

// نیا ویڈیو لیکچر اپ لوڈ کریں (ملٹی پارٹ فارم ڈیٹا)
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const classGrade = formData.get("classGrade") as string;
        const subject = formData.get("subject") as string;

        if (!file || !title || !classGrade || !subject) {
          return createApiResponse(400, null, "Missing required fields: file, title, classGrade, subject");
        }

        // فائل Firebase Storage میں اپ لوڈ کریں
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${tenantId}/video_lectures/${Date.now()}_${file.name}`;
        const bucket = adminStorage.bucket();
        const fileRef = bucket.file(fileName);
        await fileRef.save(buffer, { contentType: file.type });
        await fileRef.makePublic();
        const videoUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Firestore میں ریکارڈ
        const docRef = await adminDb.collection("video_lectures").add({
          title: title.trim(),
          description: description || "",
          classGrade,
          subject,
          videoUrl,
          fileName: file.name,
          uploadedBy: user.uid,
          tenantId,
          createdAt: new Date(),
        });

        return createApiResponse(201, { id: docRef.id, videoUrl });
      })
    )
  )
);
