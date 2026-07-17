export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { StudentRepository } from "@/repositories/student.repository";
import type { TenantContext } from "@/types/api";
import jsPDF from "jspdf";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.certificates.generate)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const type = searchParams.get("type") || "degree";

        if (!studentId) return createErrorResponse(400, "Missing studentId");

        const studentRepo = new StudentRepository();
        const studentData = await studentRepo.findById(studentId, tenantId);
        if (!studentData) return createErrorResponse(404, "Student not found");

        const student = studentData as any;

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
