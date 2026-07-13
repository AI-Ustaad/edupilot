import { FieldValue } from "firebase-admin/firestore";
import { withErrorHandler, withAuth, withTenant } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { AuditService } from "@/services/AuditService";
import { SectionRepository } from "@/repositories/section.repository";
import type { TenantContext } from "@/types/api";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ==========================================
// 1. GET: Fetch Sections Securely
// ==========================================
export const GET = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.students.view)(async (req: Request, { tenantId }: TenantContext) => {
        const sectionRepo = new SectionRepository();
        const sections = await sectionRepo.findAllActive(tenantId);
        return createSuccessResponse(sections);
      })
    )
  )
);

// ==========================================
// 2. POST: Create New Section
// ==========================================
export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.classes.create)(async (req: Request, { tenantId, user }: TenantContext) => {
        const data = await req.json();
        const { classGrade, sectionName, subjects } = data;

        if (!classGrade || !sectionName) {
          return createErrorResponse(400, "Class and Section name required");
        }

        const sectionRepo = new SectionRepository();
        const id = await sectionRepo.create({ classGrade, sectionName, subjects: subjects || { core: [], electives: [] }, tenantId, deleted: false, createdBy: user.uid } as any, tenantId);

        const audit = new AuditService();
        await audit.log({
          action: "class.create",
          userId: user.uid,
          tenantId,
          entityId: id,
          entityType: "section",
          metadata: { classGrade, sectionName },
        });

        return createApiResponse(201, { id }, "Section created successfully");
      })
    )
  )
);

// ==========================================
// 3. DELETE: Soft Delete Section
// ==========================================
export const DELETE = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.classes.delete)(async (req: Request, { tenantId, user }: TenantContext) => {
        const { searchParams } = new URL(req.url);
        const sectionId = searchParams.get("id");

        if (!sectionId) {
          return createErrorResponse(400, "Section ID required");
        }

        const sectionRepo = new SectionRepository();
        await sectionRepo.softDeleteBySectionId(sectionId, tenantId, user.uid);

        const audit = new AuditService();
        await audit.log({
          action: "class.delete",
          userId: user.uid,
          tenantId,
          entityId: sectionId,
          entityType: "section",
        });

        return createSuccessResponse(null, { message: "Section archived" });
      })
    )
  )
);
