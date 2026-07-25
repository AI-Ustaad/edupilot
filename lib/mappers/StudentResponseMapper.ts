// mappers/StudentResponseMapper.ts
import type { StudentEntity } from "@/entities/StudentEntity";
import type { StudentResponseDTO } from "@/dto/StudentResponseDTO";

export class StudentResponseMapper {
  static toDTO(entity: StudentEntity): StudentResponseDTO {
    return {
      id: entity.studentId || entity.id || "",
      studentId: entity.studentId,
      fullName: entity.fullName || `${entity.personal.firstName} ${entity.personal.lastName ?? ""}`.trim(),
      firstName: entity.personal.firstName,
      lastName: entity.personal.lastName,
      classGrade: entity.academic.classId,
      section: entity.academic.sectionId,
      rollNumber: entity.identity.rollNumber,
      admissionNumber: entity.identity.admissionNumber,
      cnic: entity.identity.cnicOrBForm,
      gender: entity.personal.gender,
      dob: entity.personal.dateOfBirth,
      phone: entity.contacts?.phone,
      email: entity.contacts?.email,
      address: entity.contacts?.address,
      guardianName: entity.guardian?.name,
      guardianPhone: entity.guardian?.phone,
      bloodGroup: entity.medical?.bloodGroup,
      status: entity.status,
      avatarUrl: entity.personal.avatarUrl,
      metadata: entity.metadata,
    };
  }
}
