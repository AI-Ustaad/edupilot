// validators/admission/AdmissionValidator.ts
import { z } from "zod";

export const AdmissionApprovalSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  status: z.enum(["approved", "rejected"], {
    errorMap: () => ({ message: "Status must be 'approved' or 'rejected'" }),
  }),
});

export type AdmissionApprovalInput = z.infer<typeof AdmissionApprovalSchema>;
