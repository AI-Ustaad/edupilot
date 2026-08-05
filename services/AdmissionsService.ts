// services/AdmissionsService.ts
import { StudentRepository } from "@/repositories/student.repository";
import type { IStudentRepository } from "@/interfaces/IStudentRepository";
import type { IAdmissionsService } from "@/interfaces/IAdmissionsService";

export class AdmissionsService implements IAdmissionsService {
  private repository: IStudentRepository;

  constructor(repository?: IStudentRepository) {
    this.repository = repository ?? new StudentRepository();
  }

  async approve(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.repository.update(studentId, {
      admissionStatus: "approved",
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
  }

  async reject(tenantId: string, studentId: string, userId: string): Promise<void> {
    await this.repository.update(studentId, {
      admissionStatus: "rejected",
      updatedBy: userId,
      updatedAt: new Date()
    }, tenantId);
  }
}
