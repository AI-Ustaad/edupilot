// 🆕 Force dynamic rendering because this route uses cookies (session auth)
export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { StaffRepository } from "@/repositories/staff.repository";
import type { TenantContext } from "@/types/api";

// ==========================================
// 🛡️ SECURE GET: Fetches ONLY pending leaves for the current tenant
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.staff.view)(async (req: Request, { tenantId }: TenantContext) => {
        // 1. Fetch pending leave requests for THIS tenant only
        const leavesSnap = await adminDb.collection("leave_requests")
          .where("tenantId", "==", tenantId)
          .where("status", "==", "pending")
          .get();

        // ✅ Explicitly type as any[] because Firestore data has no strict schema
        const leaves: any[] = leavesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // 2. Fetch staff for THIS tenant only (to map teacher names) via Repository
        const staffRepo = new StaffRepository();
        const staffList = await staffRepo.findAll(tenantId);

        const staffMap: Record<string, string> = {};
        staffList.forEach(s => {
          staffMap[s.id] = s.personal?.fullName || "Unknown";
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
