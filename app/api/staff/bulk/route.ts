// app/api/staff/bulk/route.ts
import { withAuth, withTenant, withErrorHandler, withRole } from "@/route-helpers";
import { createApiResponse } from "@/lib/response/apiResponse";
import { StaffService } from "@/services/staff.service";
import { StaffRepository } from "@/repositories/staff.repository";
import type { TenantContext } from "@/types/api";
import { CreateStaffSchema } from "@/lib/validation"; // barrel export
import { ZodError } from "zod";

export const POST = withErrorHandler(
  withAuth(
    withTenant(
      withRole(["admin"])(async (req: Request, { tenantId, user }: TenantContext) => {
        const body = await req.json();

        // توقع ہے کہ body.staffMembers ایک array ہوگی
        if (!Array.isArray(body.staffMembers) || body.staffMembers.length === 0) {
          return createApiResponse(400, null, "Provide at least one staff member in 'staffMembers' array.");
        }

        const service = new StaffService(new StaffRepository());
        const createdIds: string[] = [];
        const errors: { index: number; message: string }[] = [];

        // ایک ایک ریکارڈ کی تصدیق اور تخلیق
        for (let i = 0; i < body.staffMembers.length; i++) {
          const raw = body.staffMembers[i];
          try {
            const validated = CreateStaffSchema.parse(raw);
            const createData = {
              ...validated,
              tenantId,
              createdBy: user.uid,
            } as any; // TypeScript کو خاموش کرنے کے لیے (BaseRepository کی ضرورت کے مطابق)

            const id = await (service as any).repo.bulkCreate
              ? await service.repo.bulkCreate([createData], tenantId).then(ids => ids[0])
              : await service.createStaff(raw, tenantId, user.uid).then(s => s.id); // fallback

            createdIds.push(id || 'unknown');
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
          errors.length > 0 ? 207 : 201,  // 207 Multi-Status اگر کچھ ناکام ہوں
          { createdIds, errors: errors.length > 0 ? errors : undefined },
          `Created ${createdIds.length} out of ${body.staffMembers.length} staff members.`
        );
      })
    )
  )
);
