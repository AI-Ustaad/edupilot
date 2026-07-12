// Force dynamic rendering - uses session cookies for auth
export const dynamic = 'force-dynamic';

import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { MarksService } from "@/services/marks.service";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

// ==========================================
// GET: Fetch Aggregated Results Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const classGrade = searchParams.get("classGrade");
        const section = searchParams.get("section");
        const term = searchParams.get("term");

        if (!classGrade || !section || !term) {
          return createErrorResponse(400, "Class, Section, and Term are required");
        }

        const service = new MarksService();
        const results = await service.getAggregatedResults(tenantId, classGrade, section, term);

        return createSuccessResponse(results);
      })
    )
  )
);
// Force dynamic rendering - uses session cookies for auth
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';

// ==========================================
// GET: Fetch Aggregated Results Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const classGrade = searchParams.get("classGrade");
        const section = searchParams.get("section");
        const term = searchParams.get("term");

        if (!classGrade || !section || !term) {
          return NextResponse.json({ 
            success: false, 
            message: "Class, Section, and Term are required" 
          }, { status: 400 });
        }

        // 1. Fetch students in this class/section
        const studentsSnap = await adminDb.collection("students")
          .where("tenantId", "==", tenantId)
          .where("classGrade", "==", classGrade)
          .where("section", "==", section)
          .get();

        const students: any[] = studentsSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((s: any) => !s.deleted);

        // 2. Fetch marks for this class/section/term
        const marksSnap = await adminDb.collection("marks")
          .where("tenantId", "==", tenantId)
          .where("classGrade", "==", classGrade)
          .where("section", "==", section)
          .where("term", "==", term)
          .get();

        const marks: any[] = marksSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter((m: any) => !m.deleted);

        // 3. Aggregate data per student
        const results = students.map(student => {
          const studentMarks = marks.filter(m => m.studentId === student.id);
          
          const totalObtained = studentMarks.reduce((sum, m) => sum + (Number(m.marksObtained) || 0), 0);
          const totalMax = studentMarks.reduce((sum, m) => sum + (Number(m.totalMarks) || 0), 0);
          const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : "0.00";
          
          // Consistent Grade Calculation
          const pct = parseFloat(percentage);
          let grade = "U";
          if (pct >= 90) grade = "A++";
          else if (pct >= 80) grade = "A+";
          else if (pct >= 70) grade = "A";
          else if (pct >= 60) grade = "B";
          else if (pct >= 50) grade = "C";
          else if (pct >= 40) grade = "D";

          return {
            studentId: student.id,
            studentName: student.fullName || student.name || "Unknown",
            rollNumber: student.rollNumber || "-",
            marks: studentMarks,
            totalObtained,
            totalMax,
            percentage,
            grade,
          };
        });

        // Sort by percentage descending (toppers first)
        results.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

        return NextResponse.json({ success: true, data: results });
      })
    )
  )
);
