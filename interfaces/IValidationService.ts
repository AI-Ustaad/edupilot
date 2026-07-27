// interfaces/IValidationService.ts
export interface IValidationService {
  validate(schema: any, data: any): { success: boolean; data?: any; errors?: { field: string; message: string }[] };
  validateOrThrow(schema: any, data: any): any;
  validatePartial(schema: any, data: any): { success: boolean; data?: any; errors?: { field: string; message: string }[] };
}
