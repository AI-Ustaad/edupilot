import { NextResponse } from "next/server";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportCardTemplate } from "@/lib/pdf/ReportCardTemplate";
import React from "react";
import { ReportService } from "@/services/report.service";

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
          return new NextResponse(JSON.stringify({ success: false, message: "Student ID required" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const service = new ReportService();
        const pdfBuffer = await service.generateReportCard(tenantId, studentId, term);

        const student = await (new (await import("@/repositories/student.repository")).StudentRepository()).findById(studentId, tenantId);
        const studentName = student?.fullName || student?.name || "Unknown";

        return new NextResponse(pdfBuffer as BodyInit, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Report_${studentName}_${term}.pdf"`,
          },
        });
      })
    )
  )
);
