import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const url = new URL(req.url);
        const studentId = url.pathname.split("/").pop();

        if (!studentId) {
          return NextResponse.json({ success: false, message: "Student ID required" }, { status: 400 });
        }

        try {
          // 🛡️ Fetch logs where the student is the main entity OR mentioned in metadata
          // Since Firestore doesn't support OR queries easily without composite indexes, 
          // we fetch logs for this tenant and filter by studentId in memory (limited to recent 50 for performance).
          
          const logsSnap = await adminDb.collection("logs")
            .where("tenantId", "==", tenantId)
            .orderBy("createdAt", "desc")
            .limit(100) // Fetch recent 100 logs for performance
            .get();

          // Filter logs relevant to this specific student
          const studentLogs = logsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((log: any) => {
              // Check if log is directly about this student
              if (log.entityType === 'student' && log.entityId === studentId) return true;
              // Check if log is about marks/fees/attendance for this student
              if (log.metadata?.studentId === studentId) return true;
              return false;
            })
            .slice(0, 20); // Limit UI to last 20 actions

          return NextResponse.json({ success: true, data: studentLogs });

        } catch (error) {
          console.error("Timeline API Error:", error);
          return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
        }
      })
    )
  )
);
