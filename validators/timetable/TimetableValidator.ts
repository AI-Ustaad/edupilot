// validators/timetable/TimetableValidator.ts
import { z } from "zod";

export const CreateTimetableEntrySchema = z.object({
  day: z.string().min(1, "Day is required"),
  period: z.string().min(1, "Period is required"),
  subject: z.string().min(1, "Subject is required"),
  classGrade: z.string().min(1, "Class is required"),
  teacher: z.string().min(1, "Teacher is required"),
  meetingLink: z.string().url("Invalid meeting link URL").optional().or(z.literal("")),
});

export type CreateTimetableEntryInput = z.infer<typeof CreateTimetableEntrySchema>;
