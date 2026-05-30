import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StaffService } from "@/services/staff.service";
import { StaffRepository } from "@/repositories/staff.repository";
import type { TenantContext } from "@/types/api";
import { CreateStaffSchema } from "@/lib/validation";
import { ZodError } from "zod";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();
        if (!Array.isArray(body.staffMembers) || body.staffMembers.length === 0) {
          return createApiResponse(400, null, "Provide at least one staff member in 'staffMembers' array.");
        }

        const service = new StaffService(new StaffRepository());
        const createdIds: string[] = [];
        const errors: { index: number; message: string }[] = [];

        for (let i = 0; i < body.staffMembers.length; i++) {
          try {
            const staff = await service.createStaff(body.staffMembers[i], tenantId, user.uid);
            createdIds.push(staff.id);
          } catch (err) {
            if (err instanceof ZodError) {
              errors.push({ index: i, message: err.errors.map(e => e.message).join(', ') });
            } else {
              errors.push({ index: i, message: (err as Error).message });
            }
          }
        }

        if (errors.length === body.staffMembers.length) {
          return createApiResponse(400, { errors }, "All records failed validation.");
        }

        return createApiResponse(
          errors.length > 0 ? 207 : 201,
          { createdIds, errors: errors.length > 0 ? errors : undefined },
          `Created ${createdIds.length} out of ${body.staffMembers.length} staff members.`
        );
      })
    )
  )
);
