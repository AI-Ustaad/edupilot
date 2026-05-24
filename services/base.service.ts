// services/base.service.ts
export abstract class BaseService {
  protected validateRequired(data: any, fields: string[]) {
    for (const field of fields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
  }
}
