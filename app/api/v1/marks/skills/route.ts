export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "teacher"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const { studentId, term, subject, skills } = await req.json();
        if (!studentId || !term || !subject || !skills) {
          return createApiResponse(400, null, "Missing required fields");
        }

        // موجودہ مارکس تلاش کریں یا نیا بنائیں
        const marksQuery = await adminDb
          .collection("marks")
          .where("studentId", "==", studentId)
          .where("term", "==", term)
          .where("subject", "==", subject)
          .where("tenantId", "==", tenantId)
          .limit(1)
          .get();

        if (marksQuery.empty) {
          // نیا ریکارڈ بنائیں جس میں صرف skills ہوں
          await adminDb.collection("marks").add({
            studentId,
            term,
            subject,
            skills,
            updatedBy: user.uid,
            tenantId,
            updatedAt: new Date(),
          });
        } else {
          await marksQuery.docs[0].ref.update({
            skills,
            updatedBy: user.uid,
            updatedAt: new Date(),
          });
        }

        return createApiResponse(200, { success: true });
      })
    )
  )
);

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId");
      const term = searchParams.get("term");
      if (!studentId) return createApiResponse(400, null, "Student ID required");

      let query = adminDb.collection("marks")
        .where("studentId", "==", studentId)
        .where("tenantId", "==", tenantId);
      if (term) query = query.where("term", "==", term);

      const snapshot = await query.get();
      const skillsData = snapshot.docs.map(d => d.data().skills).filter(Boolean);
      return createApiResponse(200, skillsData);
    })
  )
);
