// interfaces/IAdmissionsService.ts

export interface IAdmissionsService {
  approve(tenantId: string, studentId: string, userId: string): Promise<void>;
  reject(tenantId: string, studentId: string, userId: string): Promise<void>;
}
