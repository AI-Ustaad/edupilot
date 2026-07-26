export const dynamic = 'force-dynamic';
import { adminAuth } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { withPermission } from "@/lib/auth/rbac";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { createSuccessResponse, createErrorResponse, createApiResponse } from "@/lib/api/response";
import { UserRepository } from "@/repositories/user.repository";
import type { TenantContext } from "@/types/api";

const userRepo = new UserRepository();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withPermission(PERMISSIONS.users.create)(async (req: Request, { tenantId }: TenantContext) => {
        const body = await req.json();
        const { email, password, role } = body;

        if (!email || !password || !role) {
          return createErrorResponse(400, "Email, password, and role are required");
        }

        const allowedRoles = ["admin", "teacher", "accountant", "student", "parent"];
        if (!allowedRoles.includes(role)) {
          return createErrorResponse(400, "Invalid role");
        }

        const newUser = await adminAuth.createUser({ email, password });
        await adminAuth.setCustomUserClaims(newUser.uid, { role, tenantId });
        await userRepo.create({
          uid: newUser.uid,
          email,
          role,
          tenantId,
          createdAt: new Date(),
        } as any);

        return createApiResponse(201, { uid: newUser.uid });
      })
    )
  )
);
