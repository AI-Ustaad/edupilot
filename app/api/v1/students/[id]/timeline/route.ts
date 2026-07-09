import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { logger } from "@/lib/logger/logger";
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
          const logsSnap = await adminDb.collection("logs")
            .where("tenantId", "==", tenantId)
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

          const studentLogs = logsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((log: any) => {
              if (log.entityType === 'student' && log.entityId === studentId) return true;
              if (log.metadata?.studentId === studentId) return true;
              return false;
            })
            .slice(0, 20);

          return NextResponse.json({ success: true, data: studentLogs });

        } catch (error) {
          logger.error("Timeline API Error:", { metadata: { error } });
          return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
        }
      })
    )
  )
);
