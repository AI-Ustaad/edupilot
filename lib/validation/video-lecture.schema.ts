import { z } from "zod";

export const createVideoLectureSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  classGrade: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  videoUrl: z.string().url("Must be a valid URL").or(z.literal("")), // or handle file upload separately
});

export const updateVideoLectureSchema = createVideoLectureSchema.partial();
