// lib/mappers/StudentPersistenceMapper.ts
import { FieldValue } from "firebase-admin/firestore";
import type { CreateStudentInput } from "@/validators/student";
import type { StudentDocument, StudentEntity, StudentStatus } from "@/entities/student.entity";

export class StudentPersistenceMapper {
  
  /**
   * Domain Aggregate -> Firestore Flat Document
   */
  static toFirestore(student: CreateStudentInput, userId: string): StudentDocument {
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
      
      // Contacts
      phone: student.contacts?.phone || "",
      email: student.contacts?.email || "",
      address: student.contacts?.address || "",
      
      // Guardian
      guardianName: student.guardian?.name || "",
      guardianRelation: student.guardian?.relation || "",
      guardianPhone: student.guardian?.phone || "",
      emergencyContactPhone: student.parentReferences.emergencyContactPhone || student.guardian?.phone || "",
      
      // Medical
      bloodGroup: student.medical?.bloodGroup || "",
      medicalConditions: student.medical?.conditions || "",
      
      // Demographics
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
        updatedBy: userId,
        source: student.metadata?.source || "web",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }
    };
  }

  /**
   * Firestore Flat Document -> Domain Entity
   */
  static fromFirestore(doc: StudentDocument): StudentEntity {
    const firstName = doc.fullName?.split(" ")[0] || "";
    const lastName = doc.fullName?.split(" ").slice(1).join(" ") || "";

    return {
      // Immutable Identifier
      studentId: doc.id || "",
      id: doc.id || "", // Legacy compat
      
      // --- Enterprise Domain Aggregate ---
      identity: {
        admissionNumber: doc.admissionNumber || "",
        // Fixed: Convert string back to number for Domain
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
        // Return empty string if null for strict type matching
        primaryParentId: doc.primaryParentId || "", 
        emergencyContactPhone: doc.emergencyContactPhone || "",
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

      // --- TODO: Remove after Student Module Migration v2 ---
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
