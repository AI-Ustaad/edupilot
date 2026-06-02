import { z } from "zod";

export const createHomeworkSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  classGrade: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  subject: z.string().min(1, "Subject is required"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
});

export const updateHomeworkSchema = createHomeworkSchema.partial();

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>;
