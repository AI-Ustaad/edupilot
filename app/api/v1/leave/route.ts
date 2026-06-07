import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import type { TenantContext } from "@/types/api";

// 🛡️ SECURE GET: Fetches ONLY pending leaves for the current tenant
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(async (req: Request, { tenantId }: TenantContext) => {
        // 1. Fetch pending leave requests for THIS tenant only
        const leavesSnap = await adminDb.collection("leave_requests")
          .where("tenantId", "==", tenantId)
          .where("status", "==", "pending")
          .get();

        const leaves = leavesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Fetch staff for THIS tenant only (to map teacher names)
        const staffSnap = await adminDb.collection("staff")
          .where("tenantId", "==", tenantId)
          .get();

        const staffMap: Record<string, string> = {};
        staffSnap.docs.forEach(d => {
          const data = d.data();
          staffMap[d.id] = data.personal?.fullName || data.fullName || "Unknown";
        });

        // 3. Merge data safely
        const enrichedLeaves = leaves.map(leave => ({
          ...leave,
          teacherName: staffMap[leave.teacherId] || "Unknown Teacher"
        }));

        return NextResponse.json({ success: true, data: enrichedLeaves });
      })
    )
  )
);
