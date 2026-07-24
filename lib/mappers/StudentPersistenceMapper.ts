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
   * Includes Legacy Compatibility Fields for smooth migration
   */
  static fromFirestore(docData: any) {
    const firstName = docData.fullName?.split(" ")[0] || "";
    const lastName = docData.fullName?.split(" ").slice(1).join(" ") || "";

    return {
      id: docData.id,
      
      // --- Enterprise Domain Aggregate ---
      identity: {
        admissionNumber: docData.admissionNumber,
        rollNumber: docData.rollNumber,
        cnicOrBForm: docData.cnic,
      },
      personal: {
        firstName: firstName,
        lastName: lastName,
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

      // --- 🚀 LEGACY COMPATIBILITY FIELDS (Phase 2) ---
      // یہ پرانے فیلڈز ہیں جو پرانے کوڈ کو ٹوٹنے سے بچائیں گے
      fullName: docData.fullName || `${firstName} ${lastName}`.trim(),
      fatherName: docData.fatherName || docData.guardianName || "",
      classGrade: docData.classGrade || docData.academic?.classId || "",
      section: docData.section || docData.academic?.sectionId || "",
      phone: docData.phone || docData.contacts?.phone || "",
      email: docData.email || docData.contacts?.email || "",
      address: docData.address || docData.contacts?.address || "",
      guardianName: docData.guardianName || docData.guardian?.name || "",
      guardianPhone: docData.guardianPhone || docData.guardian?.phone || "",
      bloodGroup: docData.bloodGroup || docData.medical?.bloodGroup || "",
      medicalConditions: docData.medicalConditions || docData.medical?.conditions || "",
      dob: docData.dob || docData.personal?.dateOfBirth || "",
      gender: docData.gender || docData.personal?.gender || "Male",
      photoBase64: docData.photoBase64 || docData.personal?.avatarUrl || "",
      religion: docData.religion || docData.demographics?.religion || "",
      nationality: docData.nationality || docData.demographics?.nationality || "",
      previousSchool: docData.previousSchool || docData.demographics?.previousSchool || "",
      admissionNumber: docData.admissionNumber || docData.identity?.admissionNumber || "",
      rollNumber: docData.rollNumber || docData.identity?.rollNumber || "",
      cnic: docData.cnic || docData.identity?.cnicOrBForm || "",
      primaryParentId: docData.primaryParentId || docData.parentReferences?.primaryParentId || null,
    };
  }
}
