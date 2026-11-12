// validators/timetable/TimetableValidator.ts
import { z } from "zod";

export const CreateTimetableEntrySchema = z.object({
  day: z.string().min(1, "Day is required"),
  period: z.union([z.string(), z.number()]).transform(v => String(v)),
  subject: z.string().min(1, "Subject is required"),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().optional(),
  teacher: z.string().min(1, "Teacher is required"),
  meetingLink: z.string().url("Invalid meeting link URL").optional().or(z.literal("")),
});

export type CreateTimetableEntryInput = z.infer<typeof CreateTimetableEntrySchema>;
