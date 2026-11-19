export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse } from "@/lib/api/response";
import { MenuService } from "@/services/menu.service";
import type { TenantContext } from "@/types/api";

const menuService = new MenuService();

export const DEFAULT_CANONICAL_MENU = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "students", label: "All Students", path: "/students" },
  { id: "staff", label: "All Staff", path: "/staff" },
  { id: "payroll", label: "Payroll", path: "/payroll" },
  { id: "classes", label: "Classes & Academics", path: "/classes" },
  { id: "attendance", label: "Attendance", path: "/attendance" },
  { id: "exams", label: "Exam Management", path: "/exams" },
  { id: "marks", label: "Marks Entry", path: "/marks" },
  { id: "result", label: "Exam Results", path: "/result" },
  { id: "fees", label: "Fee Management", path: "/fees" },
  { id: "timetable", label: "Timetable", path: "/timetable" },
  { id: "ai-assistant", label: "AI Assistant", path: "/ai-chatbot" },
  { id: "parents", label: "Parent Directory", path: "/admin/parents" },
  { id: "school-setup", label: "School Setup", path: "/admin/school-setup" },
  { id: "audit", label: "Audit Center", path: "/admin/audit" },
  { id: "settings", label: "General Settings", path: "/settings/general" },
];

export const GET = withErrorHandler(
  withAuth(
    withTenant(async (req: Request, { tenantId }: TenantContext) => {
      const menu = await menuService.getMenu(tenantId);
      const items = (Array.isArray(menu) && menu.length > 0) ? menu : DEFAULT_CANONICAL_MENU;
      return createSuccessResponse({ items });
    })
  )
);

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.settings.manage)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const items = Array.isArray(body) ? body : (body.items || []);
        await menuService.saveMenu(tenantId, items);
        return createSuccessResponse(null, { message: "Menu saved successfully" });
      })
    )
  )
);
