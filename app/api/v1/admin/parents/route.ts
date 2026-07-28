export const dynamic = 'force-dynamic';
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { AuthService } from "@/services/auth.service";
import { ParentsService } from "@/services/parents.service";
import { RegisterParentSchema } from "@/validators/parent";
import type { TenantContext } from "@/types/api";

const authService = new AuthService();

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();

        const parsed = RegisterParentSchema.safeParse(body);
        if (!parsed.success) {
          return createErrorResponse(400, "Validation failed", parsed.error.errors);
        }

        const { email, password, fullName, phone, studentIds } = parsed.data;

        let newUser;
        try {
          const result = await authService.createUser(email, password, { role: "parent" });
          newUser = { uid: result.uid };
          await authService.setCustomUserClaims(newUser.uid, { role: "parent", tenantId });
        } catch (err: any) {
          return createErrorResponse(400, err.message || "Failed to create auth user");
        }

        const service = new ParentsService();
        await service.createParent(
          { email, fullName, phone, studentIds },
          tenantId,
          user.uid
        );

        return createSuccessResponse({ uid: newUser.uid }, { message: "Parent created successfully" });
      }
    )
  )
);

