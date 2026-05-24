import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import type { TenantContext } from "@/types/api";
import jsPDF from "jspdf";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const type = searchParams.get("type") || "degree";

        if (!studentId) return createApiResponse(400, null, "Missing studentId");

        const studentDoc = await adminDb.collection("students").doc(studentId).get();
        if (!studentDoc.exists) return createApiResponse(404, null, "Student not found");
        const student = studentDoc.data();

        const doc = new jsPDF();
        doc.setFont("helvetica");
        doc.setFontSize(22);
        doc.text(type === "degree" ? "DEGREE CERTIFICATE" : "TRANSFER CERTIFICATE", 105, 40, { align: "center" });
        doc.setFontSize(12);
        doc.text(`This is to certify that ${student?.fullName}, son/daughter of ${student?.fatherName},`, 20, 80);
        doc.text(`has successfully completed Class ${student?.classGrade} with Roll No. ${student?.rollNumber}.`, 20, 90);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 120);
        doc.text("Principal's Signature", 150, 150);

        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
        return new Response(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="certificate_${studentId}.pdf"`,
          },
        });
      })
    )
  )
);
