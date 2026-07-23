import { FieldValue } from "firebase-admin/firestore";
import type { CreateStudentInput } from "@/validators/student";

export class StudentPersistenceMapper {
  
  /**
   * Domain Aggregate -> Firestore Flat Document
   * Maintains backward compatibility with Legacy Repository
   */
  static toFirestore(student: CreateStudentInput, userId: string) {
    return {
      // Identity
      admissionNumber: student.identity.admissionNumber || "",
      rollNumber: student.identity.rollNumber ? String(student.identity.rollNumber) : "",
      cnic: student.identity.cnicOrBForm || "",
      
      // Personal
      fullName: `${student.personal.firstName} ${student.personal.lastName ?? ""}`.trim(),
      gender: student.personal.gender,
      dob: student.personal.dateOfBirth || "",
      photoBase64: student.personal.avatarUrl || "",
      
      // Academic
      classGrade: student.academic.classId,
      section: student.academic.sectionId || "A",
      admissionDate: student.academic.admissionDate,
      
      // Contacts Mapping
      phone: student.contacts?.phone || "",
      email: student.contacts?.email || "",
      address: student.contacts?.address || "",
      
      // Guardian Mapping
      guardianName: student.guardian?.name || "",
      guardianRelation: student.guardian?.relation || "",
      guardianPhone: student.guardian?.phone || "",
      emergencyContactPhone: student.parentReferences.emergencyContactPhone || student.guardian?.phone || "",
      
      // Medical Mapping
      bloodGroup: student.medical?.bloodGroup || "",
      medicalConditions: student.medical?.conditions || "",
      
      // Demographics Mapping
      religion: student.demographics?.religion || "",
      nationality: student.demographics?.nationality || "",
      previousSchool: student.demographics?.previousSchool || "",
      
      // System
      status: student.status,
      primaryParentId: student.parentReferences.primaryParentId || null,
      
      // Enterprise Metadata (Technical Only)
      metadata: {
        version: student.metadata?.version || 1,
        createdBy: userId,
        source: student.metadata?.source || "web",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }
    };
  }

  /**
   * Firestore Flat Document -> Domain Aggregate (Entity)
   * Future Response Layer will use this
   */
  static fromFirestore(docData: any) {
    return {
      id: docData.id,
      identity: {
        admissionNumber: docData.admissionNumber,
        rollNumber: docData.rollNumber,
        cnicOrBForm: docData.cnic,
      },
      personal: {
        firstName: docData.fullName?.split(" ")[0] || "",
        lastName: docData.fullName?.split(" ").slice(1).join(" ") || "",
        gender: docData.gender,
        dateOfBirth: docData.dob,
        avatarUrl: docData.photoBase64,
      },
      academic: {
        campusId: docData.tenantId, // Assuming tenantId maps to campusId conceptually
        classId: docData.classGrade,
        sectionId: docData.section,
        admissionDate: docData.admissionDate,
      },
      contacts: {
        phone: docData.phone,
        email: docData.email,
        address: docData.address,
      },
      guardian: {
        name: docData.guardianName,
        relation: docData.guardianRelation,
        phone: docData.guardianPhone,
      },
      parentReferences: {
        primaryParentId: docData.primaryParentId,
        emergencyContactPhone: docData.emergencyContactPhone,
      },
      medical: {
        bloodGroup: docData.bloodGroup,
        conditions: docData.medicalConditions,
      },
      demographics: {
        religion: docData.religion,
        nationality: docData.nationality,
        previousSchool: docData.previousSchool,
      },
      status: docData.status,
      metadata: docData.metadata,
    };
  }
}
