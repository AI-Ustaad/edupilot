// validators/student/CreateStudentValidator.ts
import { z } from "zod";

export const CreateStudentSchema = z.object({
  identity: z.object({
    admissionNumber: z.string().optional(),
    rollNumber: z.preprocess((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }, z.number().int().positive("Roll number must be a positive integer").optional()),
    cnicOrBForm: z.string().optional().default(""),
  }),
  personal: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().optional().default(""),
    dateOfBirth: z.string().optional().default(""),
    gender: z.enum(["Male", "Female", "Other"]).optional().default("Male"),
    avatarUrl: z.string().optional(),
  }),
  academic: z.object({
    campusId: z.string(),
    classId: z.string().min(1, "Class is required"),
    sectionId: z.string().optional().default("A"),
    admissionDate: z.string(),
  }),
  parentReferences: z.object({
    primaryParentId: z.string().optional(),
    emergencyContactPhone: z.string().optional(),
  }),
  status: z.string().optional().default("Active"),
  metadata: z.any().optional(),
  
  // For backward compatibility if flat data is sent directly
  fullName: z.string().optional(),
  classGrade: z.string().optional(),
}).refine(data => data.personal?.firstName || data.fullName, {
  message: "Either personal.firstName or fullName is required"
}).refine(data => data.academic?.classId || data.classGrade, {
  message: "Either academic.classId or classGrade is required"
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
