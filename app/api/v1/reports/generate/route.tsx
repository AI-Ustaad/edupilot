import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportCardTemplate } from "@/lib/pdf/ReportCardTemplate";
import React from "react";

// Force Node.js runtime because @react-pdf/renderer uses Node streams
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get("studentId");
        const term = searchParams.get("term") || "Final Exams";

        if (!studentId) {
          return NextResponse.json({ success: false, message: "Student ID required" }, { status: 400 });
        }

        // 1. Securely Fetch Student
        const studentSnap = await adminDb.collection("students").doc(studentId).get();
        if (!studentSnap.exists || studentSnap.data()?.tenantId !== tenantId) {
          return NextResponse.json({ success: false, message: "Student not found" }, { status: 404 });
        }
        const student = studentSnap.data();

        // 2. Securely Fetch Marks for this Term
        const marksSnap = await adminDb.collection("marks")
          .where("tenantId", "==", tenantId)
          .where("studentId", "==", studentId)
          .where("term", "==", term)
          .get();

        const marks = marksSnap.docs.map(d => {
          const data = d.data();
          return {
            subject: data.subject || "Unknown Subject",
            totalMarks: Number(data.totalMarks) || 0,
            marksObtained: Number(data.marksObtained) || 0,
            grade: data.grade || "-",
          };
        });

        // 3. Fetch School Branding for the Header
        const settingsSnap = await adminDb.collection("settings").doc(tenantId).get();
        const schoolName = settingsSnap.exists ? settingsSnap.data()?.schoolName || "EduPilot Academy" : "EduPilot Academy";

        // 4. Prepare Data for PDF
        const pdfData = {
          schoolName,
          term,
          student: {
            name: student?.fullName || student?.name || "Unknown",
            fatherName: student?.fatherName || "N/A",
            classGrade: student?.classGrade || "N/A",
            section: student?.section || "N/A",
            rollNumber: student?.rollNumber || "N/A",
          },
          marks,
          aiComment: "An excellent term! Keep up the hard work and maintain focus on continuous improvement."
        };

        // 5. Generate PDF Buffer
        const buffer = await renderToBuffer(<ReportCardTemplate data={pdfData} />);

        // ✅ FIX: Convert Buffer to Uint8Array for NextResponse compatibility
        const pdfBytes = new Uint8Array(buffer);

        // 6. Return PDF as a downloadable file
        return new NextResponse(pdfBytes, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Report_${student?.fullName || studentId}_${term}.pdf"`,
          },
        });
      })
    )
  )
);
