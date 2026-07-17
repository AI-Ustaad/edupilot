import { z } from "zod";

export const LoginRequestValidator = z.object({
  idToken: z.string().min(1, "Authentication token is required."),
});
