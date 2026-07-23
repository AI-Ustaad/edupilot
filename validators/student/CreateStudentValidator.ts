import { z } from "zod";

export const CreateStudentSchema = z.object({
  identity: z.object({
    admissionNumber: z.string().optional(),
    rollNumber: z.union([z.string(), z.number()]).optional(),
    cnicOrBForm: z.string().optional(),
  }),
  personal: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(["Male", "Female", "Other"]).default("Male"),
    avatarUrl: z.string().optional(),
  }),
  academic: z.object({
    campusId: z.string(),
    classId: z.string(),
    sectionId: z.string().default("A"),
    admissionDate: z.string(),
  }),
  parentReferences: z.object({
    primaryParentId: z.string().nullable().optional(), // 🚀 Fixed: Nullable & Optional
    emergencyContactPhone: z.string().optional(),
  }),
  
  // 🚀 Enterprise Domain Objects (No more extendedData)
  contacts: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().optional(),
  }).optional(),
  
  guardian: z.object({
    name: z.string().optional(),
    relation: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  
  medical: z.object({
    bloodGroup: z.string().optional(),
    conditions: z.string().optional(),
  }).optional(),
  
  demographics: z.object({
    religion: z.string().optional(),
    nationality: z.string().optional(),
    previousSchool: z.string().optional(),
  }).optional(),

  status: z.string().default("Active"),
  metadata: z.object({
    version: z.number().default(1),
    source: z.string().optional(),
    traceId: z.string().optional(),
    // createdAt, updatedAt, createdBy will be injected by Mapper/Service
  }).optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
