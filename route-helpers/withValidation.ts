// middleware/withValidation.ts
import { z } from "zod";
import { createApiResponse } from "@/lib/response/apiResponse";

export function withValidation(schema: z.ZodSchema) {
  return (handler: Function) => async (req: Request, context?: any) => {
    let body;
    try {
      body = await req.json();
      const validated = schema.parse(body);
      return handler(req, { ...context, validated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createApiResponse(400, null, "Validation failed", error.errors);
      }
      return createApiResponse(400, null, "Invalid request body");
    }
  };
}
