// services/AdmissionsService.ts
import { StudentRepository } from "@/repositories/student.repository";
import type { IStudentRepository } from "@/interfaces/IStudentRepository";
import type { IAdmissionsService } from "@/interfaces/IAdmissionsService";
import { eventBus } from "@/lib/events";
import { EVENTS } from "@/lib/events/event-types";

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

    const student = await this.repository.findById(studentId, tenantId);
    const studentData = {
      fullName: student?.fullName || student?.firstName || "",
      classGrade: student?.classGrade || "",
      section: student?.section || "",
      admissionNumber: student?.admissionNumber,
      rollNumber: student?.rollNumber,
    };

    await eventBus.publish(EVENTS.ADMISSION_APPROVED, {
      tenantId,
      studentId,
      studentData,
      approvedBy: userId,
      userId,
    }, tenantId);

    await eventBus.publish(EVENTS.STUDENT_ENROLLED, {
      tenantId,
      studentId,
      studentData,
      approvedBy: userId,
      userId,
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
