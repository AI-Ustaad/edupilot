// lib/validation/staff.schema.ts
import { z } from "zod";

export const createStaffSchema = z.object({
  personal: z.object({
    fullName: z.string().min(2, "Full name is required"),
    fatherName: z.string().optional(),
    cnic: z.string().optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
    bloodGroup: z.string().optional(),
    nationality: z.string().optional(),
    religion: z.string().optional(),
    maritalStatus: z.string().optional(),
    photo: z.string().optional(),
  }).optional(),
  contact: z.object({
    mobile: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    currentAddress: z.string().optional(),
    permanentAddress: z.string().optional(),
    city: z.string().optional(),
    province: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  professional: z.object({
    personnelNo: z.string().optional(),
    employeeId: z.string().optional(),
    designation: z.string().optional(),
    department: z.string().optional(),
    role: z.string().optional(),
    employmentType: z.string().optional(),
    joiningDate: z.string().optional(),
    confirmationDate: z.string().optional(),
    experience: z.string().optional(),
    qualification: z.string().optional(),
  }).optional(),
}).passthrough(); // باقی fields (payroll, education, etc.) کو پاس ہونے دیں

export const updateSchema = createStaffSchema.partial();

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateSchema>;
