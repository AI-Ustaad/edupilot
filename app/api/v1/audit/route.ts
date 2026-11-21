export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { AuditService } from "@/services/AuditService";
import { UserRepository } from "@/repositories/user.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import type { TenantContext } from "@/types/api";

const auditService = new AuditService();
const userRepo = new UserRepository();
const staffRepo = new StaffRepository();

export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.audit.view)(async (req: Request, { tenantId }: TenantContext) => {
        const logs = await auditService.queryByTenant(tenantId, { limit: 100 });

        // Build user map for fast name and email resolution
        const userMap = new Map<string, { name: string; email: string; role?: string }>();
        try {
          const [users, staffList] = await Promise.all([
            userRepo.findAllByTenant(tenantId).catch(() => []),
            staffRepo.findAll(tenantId).catch(() => []),
          ]);

          for (const u of (users as any[])) {
            const id = u.uid || u.id;
            if (id) {
              const name = u.name || u.displayName || (u.email ? u.email.split("@")[0] : "Admin User");
              userMap.set(id, { name, email: u.email || "", role: u.role });
            }
          }

          for (const s of (staffList as any[])) {
            const name = s.name || s.fullName || "Staff Member";
            const email = s.email || "";
            const role = s.designation || s.role || "staff";
            if (s.id) userMap.set(s.id, { name, email, role });
            if (s.userId) userMap.set(s.userId, { name, email, role });
          }
        } catch {
          // Continue gracefully if resolution fails
        }

        const enrichedLogs = logs.map((log: any) => {
          let isoDate: string | null = null;
          if (log.createdAt) {
            if (typeof log.createdAt.toDate === "function") {
              isoDate = log.createdAt.toDate().toISOString();
            } else if (log.createdAt._seconds !== undefined) {
              isoDate = new Date(log.createdAt._seconds * 1000).toISOString();
            } else if (log.createdAt.seconds !== undefined) {
              isoDate = new Date(log.createdAt.seconds * 1000).toISOString();
            } else if (typeof log.createdAt === "number") {
              isoDate = new Date(log.createdAt).toISOString();
            } else if (typeof log.createdAt === "string") {
              isoDate = log.createdAt;
            }
          }

          const userInfo = userMap.get(log.userId);
          const userName = userInfo?.name || (log.userId === "system" ? "System" : undefined);
          const userEmail = userInfo?.email;
          const userRole = userInfo?.role;

          return {
            ...log,
            createdAt: isoDate || log.createdAt,
            userName,
            userEmail,
            userRole,
          };
        });

        return createSuccessResponse(enrichedLogs);
      })
    )
  )
);
