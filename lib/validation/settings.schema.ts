// lib/validation/settings.schema.ts
import { z } from "zod";

export const ClassSchema = z.string().min(1, "Class name is required");

export const SectionSchema = z.object({
  classGrade: z.string().min(1, "Class is required"),
  sectionName: z.string().min(1, "Section name is required"),
  incharge: z.string().optional(),
});

export const SubjectSchema = z.string().min(1, "Subject name is required");

export const PeriodSchema = z.object({
  name: z.string().min(1, "Period name is required"),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid start time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid end time format"),
});

export const SettingsSchema = z.object({
  classes: z.array(ClassSchema).default([]),
  sections: z.array(SectionSchema).default([]),
  subjects: z.array(SubjectSchema).default([]),
  periods: z.array(PeriodSchema).default([]),
});
