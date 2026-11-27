// B11 (26 Nov audit) — Admin Syllabus "Add Material" silently failed because
// the client POSTs to /api/v1/syllabus but no POST handler / service create
// existed. This schema validates the create payload the same way the other
// module schemas (e.g. homework.schema.ts) do.
import { z } from "zod";

const urlIfPresent = z
  .string()
  .optional()
  .default("")
  .refine((val) => !val || /^https?:\/\/.+/.test(val), {
    message: "Must be a valid http(s) URL",
  });

export const createSyllabusSchema = z
  .object({
    classGrade: z.string().min(1, "Class is required"),
    subject: z.string().min(1, "Subject is required"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional().default(""),
    type: z.enum(["pdf", "video", "image", "link"]).default("pdf"),
    fileUrl: urlIfPresent,
    linkUrl: urlIfPresent,
  })
  .superRefine((data, ctx) => {
    // A non-link material needs a file URL; a link material needs a link URL.
    if (data.type === "link") {
      if (!data.linkUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["linkUrl"],
          message: "Link URL is required for external links",
        });
      }
    } else if (!data.fileUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fileUrl"],
        message: "File URL is required",
      });
    }
  });

export type CreateSyllabusInput = z.infer<typeof createSyllabusSchema>;
