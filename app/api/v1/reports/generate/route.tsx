import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportCardTemplate } from "@/lib/pdf/ReportCardTemplate";
import React from "react";
import { StudentRepository } from "@/repositories/student.repository";
import { MarksRepository } from "@/repositories/marks.repository";
import { SettingsRepository } from "@/repositories/settings.repository";

// Force Node.js runtime because @react-pdf/renderer uses Node streams
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const studentRepo = new StudentRepository();
const marksRepo = new MarksRepository();
const settingsRepo = new SettingsRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const term = searchParams.get("term") || "Final Exams";

        if (!studentId) {
          return new NextResponse(JSON.stringify({ success: false, message: "Student ID required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const student = await studentRepo.findById(studentId, tenantId);
        if (!student) {
          return new NextResponse(JSON.stringify({ success: false, message: "Student not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        const marks = await marksRepo.findWithFilters(tenantId, { studentId, term });

        const settings = await settingsRepo.getConfig(tenantId);
        const schoolName = settings?.schoolName || "EduPilot Academy";

        const pdfData = {
          schoolName,
          term,
          student: {
            name: student.fullName || student.name || "Unknown",
            fatherName: student.fatherName || "N/A",
            classGrade: student.classGrade || "N/A",
            section: student.section || "N/A",
            rollNumber: student.rollNumber || "N/A",
          },
          marks: marks.map(m => ({
            subject: m.subject || "Unknown Subject",
            totalMarks: Number(m.totalMarks) || 0,
            marksObtained: Number(m.marksObtained) || 0,
            grade: m.grade || "-",
          })),
          aiComment: "An excellent term! Keep up the hard work and maintain focus on continuous improvement."
        };

        const buffer = await renderToBuffer(<ReportCardTemplate data={pdfData} />);
        const pdfBytes = new Uint8Array(buffer);

        return new NextResponse(pdfBytes, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Report_${student.fullName || student.name || studentId}_${term}.pdf"`,
          },
        });
      })
    )
  )
);
