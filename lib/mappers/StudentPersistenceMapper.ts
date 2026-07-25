// mappers/StudentPersistenceMapper.ts
import { FieldValue } from "firebase-admin/firestore";
import type { StudentDocument } from "@/documents/StudentDocument";
import type { StudentEntity, StudentStatus } from "@/entities/student.entity";
import type { CreateStudentDTO } from "@/dto/CreateStudentDTO";

export class StudentPersistenceMapper {
  
  /**
   * DTO -> Domain Entity
   */
  static fromDTO(dto: CreateStudentDTO): Partial<StudentEntity> {
    return {
      identity: {
              admissionNumber: dto.identity.admissionNumber || "",
        rollNumber: dto.identity.rollNumber ? Number(dto.identity.rollNumber) : undefined,
        cnicOrBForm: dto.identity.cnicOrBForm,
      },
      personal: {
        firstName: dto.personal.firstName,
        lastName: dto.personal.lastName,
        gender: dto.personal.gender,
        dateOfBirth: dto.personal.dateOfBirth,
        avatarUrl: dto.personal.avatarUrl,
      },
      academic: {
        campusId: dto.academic.campusId,
        classId: dto.academic.classId,
        sectionId: dto.academic.sectionId,
        admissionDate: dto.academic.admissionDate,
      },
      parentReferences: {
        primaryParentId: dto.parentReferences.primaryParentId,
        emergencyContactPhone: dto.parentReferences.emergencyContactPhone,
      },
      contacts: dto.contacts,
      guardian: dto.guardian,
      medical: dto.medical,
      demographics: dto.demographics,
      status: dto.status as StudentStatus,
      metadata: {
        version: dto.metadata?.version || 1,
        source: dto.metadata?.source,
      }
    };
  }

  /**
   * Domain Entity -> Firestore Document
   */
  static toFirestore(entity: Partial<StudentEntity>, userId: string): StudentDocument {
    return {
      admissionNumber: entity.identity?.admissionNumber || "",
      rollNumber: entity.identity?.rollNumber ? String(entity.identity.rollNumber) : "",
      cnic: entity.identity?.cnicOrBForm || "",
      
      fullName: `${entity.personal?.firstName} ${entity.personal?.lastName ?? ""}`.trim(),
      gender: entity.personal?.gender,
      dob: entity.personal?.dateOfBirth || "",
      photoBase64: entity.personal?.avatarUrl || "",
      
      classGrade: entity.academic?.classId,
      section: entity.academic?.sectionId || "A",
      admissionDate: entity.academic?.admissionDate,
      
      phone: entity.contacts?.phone || "",
      email: entity.contacts?.email || "",
      address: entity.contacts?.address || "",
      
      guardianName: entity.guardian?.name || "",
      guardianRelation: entity.guardian?.relation || "",
      guardianPhone: entity.guardian?.phone || "",
      emergencyContactPhone: entity.parentReferences?.emergencyContactPhone || entity.guardian?.phone || "",
      
      bloodGroup: entity.medical?.bloodGroup || "",
      medicalConditions: entity.medical?.conditions || "",
      
      religion: entity.demographics?.religion || "",
      nationality: entity.demographics?.nationality || "",
      previousSchool: entity.demographics?.previousSchool || "",
      
      status: entity.status,
      primaryParentId: entity.parentReferences?.primaryParentId || null,
      
      metadata: {
        version: entity.metadata?.version || 1,
        createdBy: userId,
        updatedBy: userId,
        source: entity.metadata?.source || "web",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }
    };
  }

  /**
   * Firestore Document -> Domain Entity
   */
  static fromFirestore(doc: StudentDocument): StudentEntity {
    const firstName = doc.fullName?.split(" ")[0] || "";
    const lastName = doc.fullName?.split(" ").slice(1).join(" ") || "";

    return {
      studentId: doc.id || "",
      id: doc.id || "", // Legacy compat
      
      identity: {
        admissionNumber: doc.admissionNumber || "",
        rollNumber: doc.rollNumber ? Number(doc.rollNumber) : undefined,
        cnicOrBForm: doc.cnic,
      },
      personal: {
        firstName: firstName,
        lastName: lastName,
        gender: (doc.gender as "Male" | "Female" | "Other") || "Male",
        dateOfBirth: doc.dob,
        avatarUrl: doc.photoBase64,
      },
      academic: {
        campusId: doc.tenantId || "",
        classId: doc.classGrade || "",
        sectionId: doc.section || "",
        admissionDate: doc.admissionDate || "",
      },
      parentReferences: {
        primaryParentId: doc.primaryParentId,
        emergencyContactPhone: doc.emergencyContactPhone,
      },
      contacts: {
        phone: doc.phone,
        email: doc.email,
        address: doc.address,
      },
      guardian: {
        name: doc.guardianName,
        relation: doc.guardianRelation,
        phone: doc.guardianPhone,
      },
      medical: {
        bloodGroup: doc.bloodGroup,
        conditions: doc.medicalConditions,
      },
      demographics: {
        religion: doc.religion,
        nationality: doc.nationality,
        previousSchool: doc.previousSchool,
      },
      status: (doc.status as StudentStatus) || "Active",
      
      runtimeRelations: {
        activeFeeInvoices: [],
        recentAttendanceState: null,
      },
      
      metadata: {
        version: doc.metadata?.version ?? 1,
        source: doc.metadata?.source ?? "web",
        createdBy: doc.metadata?.createdBy,
        updatedBy: doc.metadata?.updatedBy,
        createdAt: doc.metadata?.createdAt,
        updatedAt: doc.metadata?.updatedAt,
      },
      
      comments: doc.comments,

      // Legacy Compatibility Fields
      fullName: doc.fullName || `${firstName} ${lastName}`.trim(),
      fatherName: doc.guardianName || "",
      classGrade: doc.classGrade || "",
      section: doc.section || "",
      phone: doc.phone || "",
      email: doc.email || "",
      address: doc.address || "",
      guardianName: doc.guardianName || "",
      guardianPhone: doc.guardianPhone || "",
      bloodGroup: doc.bloodGroup || "",
      medicalConditions: doc.medicalConditions || "",
      dob: doc.dob || "",
      gender: doc.gender || "Male",
      photoBase64: doc.photoBase64 || "",
      religion: doc.religion || "",
      nationality: doc.nationality || "",
      previousSchool: doc.previousSchool || "",
      admissionNumber: doc.admissionNumber || "",
      rollNumber: doc.rollNumber || undefined,
      cnic: doc.cnic || "",
      primaryParentId: doc.primaryParentId || null,
      tenantId: doc.tenantId || "",
      createdAt: doc.metadata?.createdAt,
      updatedAt: doc.metadata?.updatedAt,
    } as StudentEntity;
  }
}
