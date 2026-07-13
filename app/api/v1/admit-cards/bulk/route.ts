export const dynamic = 'force-dynamic';
import { adminDb } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import type { TenantContext } from "@/types/api";
import jsPDF from "jspdf";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.exams.generate)(async (req: Request, { tenantId }: TenantContext) => {
        const { classGrade, section, examTerm, schoolName } = await req.json();
        if (!classGrade || !section || !examTerm) {
          return createErrorResponse(400, "Missing fields");
        }

        const studentsSnap = await adminDb
          .collection("students")
          .where("tenantId", "==", tenantId)
          .where("classGrade", "==", classGrade)
          .where("section", "==", section)
          .get();

        if (studentsSnap.empty) {
          return createErrorResponse(404, "No students found");
        }

        const students = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        const doc = new jsPDF();
        let y = 20;

        for (let i = 0; i < students.length; i++) {
          const s = students[i];
          if (i > 0) { doc.addPage(); y = 20; }

          doc.setFontSize(18).setFont("helvetica", "bold");
          doc.text(schoolName || "EduPilot Academy", 105, y, { align: "center" });
          y += 10;
          doc.setFontSize(12).setFont("helvetica", "normal");
          doc.text("Admit Card", 105, y, { align: "center" });
          y += 15;
          doc.setFontSize(11);
          doc.text(`Student: ${s.fullName || s.name || "N/A"}`, 20, y); y += 8;
          doc.text(`Father: ${s.fatherName || "N/A"}`, 20, y); y += 8;
          doc.text(`Class: ${s.classGrade} - ${s.section} | Roll: ${s.rollNumber}`, 20, y); y += 12;
          doc.setFont("helvetica", "bold");
          doc.text(`Exam: ${examTerm}`, 20, y); y += 10;
          doc.setFont("helvetica", "normal");
          doc.text("Principal's Signature", 120, y + 15);
          doc.text("_________________________", 20, y + 15);
        }

        const buffer = Buffer.from(doc.output("arraybuffer"));
        return new Response(buffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="admit_cards_${classGrade}_${section}.pdf"`,
          },
        });
      })
    )
  )
);
