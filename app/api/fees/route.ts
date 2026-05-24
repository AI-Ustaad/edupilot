import { adminDb, dbTimestamp } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "accountant"])(async (req: Request, { tenantId }: TenantContext) => {
        const snapshot = await adminDb
          .collection("fees")
          .where("tenantId", "==", tenantId)
          .orderBy("createdAt", "desc")
          .get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        return createApiResponse(200, data);
      })
    )
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin", "accountant"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        if (!body.studentId || !body.amountPaid) {
          return createApiResponse(400, null, "Missing payment details");
        }

        const docRef = await adminDb.collection("fees").add({
          ...body,
          amountPaid: Number(body.amountPaid),
          tenantId,
          createdBy: user.uid,
          createdAt: dbTimestamp.now(),
        });

        const studentDoc = await adminDb.collection("students").doc(body.studentId).get();
        const student = studentDoc.data();
        if (student?.parentEmail) {
          sendEmail(
            student.parentEmail,
            "Fee Payment Confirmation",
            `<p>Thank you for paying <strong>Rs. ${body.amountPaid}</strong> for <strong>${body.feeMonth}</strong>.</p>
             <p>Student: ${student.fullName || student.name} (Roll No: ${student.rollNumber})</p>
             <p>Payment Method: ${body.paymentMethod}</p>`
          ).catch(console.error);
        }

        return createApiResponse(201, { id: docRef.id }, "Payment saved");
      })
    )
  )
);
