// lib/mappers/staff.mapper.ts
// OCR → StaffForm mapper: extracts primitive values from enterprise OCR objects
// NEVER bind raw OCRConfidence objects ({ value, confidence, needsReview }) to form inputs

import {
  toDateInputFormat,
  extractPrimitive,
  extractConfidence,
  extractNeedsReview,
  getConfidenceLabel,
  toNumber,
  OCRMetaData,
} from "./shared";

// ─── Staff Form Data Types ───────────────────────────────────────────────────

export interface StaffFormPersonal {
  fullName: string;
  fatherName: string;
  cnic: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  photo: string;
}

export interface StaffFormContact {
  mobile: string;
  whatsapp: string;
  email: string;
  currentAddress: string;
  permanentAddress: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
}

export interface StaffFormProfessional {
  personnelNo: string;
  employeeId: string;
  designation: string;
  department: string;
  role: string;
  employmentType: string;
  joiningDate: string;
  confirmationDate: string;
  experience: string;
  qualification: string;
}

export interface StaffFormPayroll {
  basicSalary: number;
  allowances: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossSalary: number;
  bankName: string;
  accountNumber: string;
  iban: string;
  salaryPaymentMethod: string;
}

export interface StaffFormDocuments {
  cnicFront: string;
  cnicBack: string;
  degree: string;
  experienceCert: string;
  cv: string;
}

export interface StaffFormAcademic {
  subjects: string[];
  classesAssigned: string[];
  timetable: string;
  sectionAssignment: string;
  classTeacher: boolean;
}

export interface StaffFormEmergency {
  name: string;
  relation: string;
  phone: string;
  alternatePhone: string;
}

export interface StaffFormData {
  personal: StaffFormPersonal;
  contact: StaffFormContact;
  professional: StaffFormProfessional;
  payroll: StaffFormPayroll;
  academic: StaffFormAcademic;
  emergency: StaffFormEmergency;
  documents: StaffFormDocuments;
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

const DATE_FIELDS = new Set(["dob", "joiningDate", "confirmationDate"]);

/**
 * Maps a raw OCR API response (with OCRConfidence objects) to:
 *  1. StaffFormData with primitive values only (no [object Object])
 *  2. OCRMetaData with confidence info per field
 *
 * Usage:
 *   const { staffFormData, ocrMetadata } = mapOCRToStaffForm(result.data);
 *   setForm(staffFormData);
 *   setOcrMeta(ocrMetadata);
 */
export function mapOCRToStaffForm(
  ocrResponse: Record<string, unknown>
): {
  staffFormData: StaffFormData;
  ocrMetadata: OCRMetaData;
} {
  const raw: Record<string, any> = ocrResponse ?? {};
  const metadata: OCRMetaData = {};

  const resolve = (key: string): any => {
    const field = raw[key];
    const primitive = extractPrimitive(field);
    const confidence = extractConfidence(field);
    const needsReview = extractNeedsReview(field);

    if (confidence !== null) {
      metadata[key] = {
        confidence: { value: confidence, label: getConfidenceLabel(confidence) },
        needsReview: needsReview ?? false,
      };
    }

    if (DATE_FIELDS.has(key) && typeof primitive === "string") {
      return toDateInputFormat(primitive);
    }

    return primitive ?? "";
  };

  const resolveNum = (key: string): number => {
    const field = raw[key];
    const primitive = extractPrimitive(field);
    const confidence = extractConfidence(field);
    const needsReview = extractNeedsReview(field);

    if (confidence !== null) {
      metadata[key] = {
        confidence: { value: confidence, label: getConfidenceLabel(confidence) },
        needsReview: needsReview ?? false,
      };
    }

    return toNumber(primitive);
  };

  const photoBase64Value = raw.photoBase64 ?? "";

  const staffFormData: StaffFormData = {
    personal: {
      fullName: resolve("fullName"),
      fatherName: resolve("fatherName"),
      cnic: resolve("cnic"),
      dob: resolve("dob"),
      gender: resolve("gender"),
      bloodGroup: resolve("bloodGroup"),
      nationality: resolve("nationality"),
      religion: resolve("religion"),
      maritalStatus: resolve("maritalStatus"),
      photo: photoBase64Value,
    },
    contact: {
      mobile: resolve("phone") || resolve("mobile"),
      whatsapp: resolve("whatsapp"),
      email: resolve("email"),
      currentAddress: resolve("currentAddress"),
      permanentAddress: resolve("permanentAddress"),
      city: resolve("city"),
      province: resolve("province"),
      country: resolve("country"),
      postalCode: resolve("postalCode"),
    },
    professional: {
      personnelNo: resolve("personnelNo"),
      employeeId: resolve("employeeId"),
      designation: resolve("designation"),
      department: resolve("department"),
      role: resolve("role"),
      employmentType: resolve("employmentType"),
      joiningDate: resolve("joiningDate"),
      confirmationDate: resolve("confirmationDate"),
      experience: resolve("experience"),
      qualification: resolve("qualification"),
    },
    payroll: {
      basicSalary: resolveNum("basicSalary"),
      grossSalary: resolveNum("grossPay") || resolveNum("grossSalary"),
      bankName: resolve("bankName"),
      accountNumber: resolve("accountNumber"),
      iban: resolve("iban"),
      salaryPaymentMethod: resolve("salaryPaymentMethod"),
      allowances: [],
      deductions: [],
    },
    academic: {
      subjects: [],
      classesAssigned: [],
      timetable: "",
      sectionAssignment: "",
      classTeacher: false,
    },
    emergency: {
      name: resolve("emergencyName") || resolve("emergencyContact"),
      relation: resolve("emergencyRelation"),
      phone: resolve("emergencyPhone"),
      alternatePhone: "",
    },
    documents: {
      cnicFront: resolve("cnicFront"),
      cnicBack: resolve("cnicBack"),
      degree: resolve("degree"),
      experienceCert: resolve("experienceCert"),
      cv: resolve("cv"),
    },
  };

  return { staffFormData, ocrMetadata: metadata };
}
