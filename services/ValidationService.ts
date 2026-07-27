// services/ValidationService.ts
import { z, ZodSchema, ZodError } from "zod";
import type { IValidationService } from "@/interfaces/IValidationService";

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: { field: string; message: string }[];
}

export class ValidationService implements IValidationService {
  validate(schema: ZodSchema, data: any): ValidationResult {
    try {
      const parsed = schema.parse(data);
      return { success: true, data: parsed };
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        };
      }
      return {
        success: false,
        errors: [{ field: "unknown", message: "Validation failed" }],
      };
    }
  }

  validateOrThrow(schema: ZodSchema, data: any): any {
    const result = this.validate(schema, data);
    if (!result.success) {
      const messages = result.errors?.map((e) => `${e.field}: ${e.message}`).join("; ");
      throw new Error(`Validation failed: ${messages}`);
    }
    return result.data;
  }

  validatePartial(schema: z.ZodObject<any>, data: any): ValidationResult {
    const partialSchema = schema.partial();
    return this.validate(partialSchema as unknown as ZodSchema, data);
  }
}
