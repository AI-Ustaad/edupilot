export const dynamic = 'force-dynamic';
import { adminAuth } from "@/lib/firebase-admin";
import { withAuth, withTenant, withErrorHandler } from "@/route-helpers";
import { createSuccessResponse, createErrorResponse } from "@/lib/api/response";
import { ParentsService } from "@/services/parents.service";
import { CreateParentSchema } from "@/validators/parent";
import type { TenantContext } from "@/types/api";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();

        const parsed = CreateParentSchema.safeParse(body);
        if (!parsed.success) {
          return createErrorResponse(400, "Validation failed", parsed.error.errors);
        }

        const { email, password, fullName, phone, studentIds } = parsed.data;

        // Create Firebase Auth User
        let newUser;
        try {
          newUser = await adminAuth.createUser({ email, password });
          await adminAuth.setCustomUserClaims(newUser.uid, { role: "parent", tenantId });
        } catch (err: any) {
          return createErrorResponse(400, err.message || "Failed to create auth user");
        }

        // Save parent document via service
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

