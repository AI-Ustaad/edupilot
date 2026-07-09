// middleware/withValidation.ts
import { z } from "zod";
import { createErrorResponse } from "@/lib/api/response";

export function withValidation(schema: z.ZodSchema) {
  return (handler: Function) => async (req: Request, context?: any) => {
    let body;
    try {
      body = await req.json();
      const validated = schema.parse(body);
      return handler(req, { ...context, validated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse(400, "Validation failed", error.errors);
      }
      return createErrorResponse(400, "Invalid request body");
    }
  };
}
