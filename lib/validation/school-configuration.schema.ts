import { z } from "zod";

export const SchoolConfigurationSchema = z.object({
  schoolName: z.string().trim().min(2, "School name is required").max(160),
  schoolType: z.enum(["Private", "Government", "Madrissa"]),
  curriculumId: z.string().trim().min(1, "Education board is required"),
  levels: z.array(z.string().trim().min(1)).min(1, "Select at least one academic level"),
  sectionNames: z.array(z.string().trim().min(1).max(40)).min(1).max(50).optional(),
  country: z.string().trim().max(80).optional(),
});
