// lib/ocr/mappers/staff.mapper.ts
// OCR → StaffForm mapper: extracts primitive values from enterprise OCR objects
// NEVER bind raw OCRConfidence objects ({ value, confidence, needsReview }) to form inputs

import { OCRConfidence } from "@/types/ocr";

// ─── Staff Form Data Types ───────────────────────────────────────────────────

export interface StaffFormPersonal {
  fullName: string;
  fatherName: string;
  cnic: string;
  dob: string; // yyyy-MM-dd for <input type="date">
  gender: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  maritalStatus: string;
  photo: string; // base64 or URL
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
  joiningDate: string; // yyyy-MM-dd for <input type="date">
  confirmationDate: string;
  experience: string;
  qualification: string;
}

export interface StaffFormPayrollAllowances {
  houseRent: number;
  medical: number;
  transport: number;
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

// ─── OCR Metadata Types ──────────────────────────────────────────────────────

export interface OCRConfidenceInfo {
  value: number; // 0.0 – 1.0
  label: "High" | "Medium" | "Low";
}

export interface OCRFieldMeta {
  confidence: OCRConfidenceInfo;
  needsReview: boolean;
}

/** Maps each OCR field name to its confidence metadata */
export type OCRMetaData = Record<string, OCRFieldMeta>;

// ─── Date Helpers ────────────────────────────────────────────────────────────

/** Converts various date string formats to yyyy-MM-dd for <input type="date"> */
function toDateInputFormat(value: string): string {
  if (!value) return "";

  // Already yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // dd-MM-yyyy or dd/MM/yyyy or dd.MM.yyyy
  const match = value.match(/^(\d{2})[-/.](\d{2})[-/.](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  // yyyy/MM/dd or yyyy.MM.dd
  const match2 = value.match(/^(\d{4})[-/.](\d{2})[-/.](\d{2})$/);
  if (match2) {
    const [, year, month, day] = match2;
    return `${year}-${month}-${day}`;
  }

  // MM/dd/yyyy (US format) - heuristic: only convert if month ≤ 12 and day > 12
  const match3 = value.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (match3) {
    const [, m, d, y] = match3;
    const monthNum = parseInt(m, 10);
    const dayNum = parseInt(d, 10);
    // If month is valid (1-12) and day is clearly a day (>12 and ≤31), assume MM/dd/yyyy
    if (monthNum >= 1 && monthNum <= 12 && dayNum > 12 && dayNum <= 31) {
      return `${y}-${m}-${d}`;
    }
    // Otherwise assume dd/MM/yyyy
    return `${y}-${m}-${d}`;
  }

  // Fallback: try JS Date parsing
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return value;
}

// ─── OCR Field Detection ─────────────────────────────────────────────────────

function isOCRField(value: unknown): value is OCRConfidence {
  return (
    value !== null &&
    typeof value === "object" &&
    "value" in value &&
    "confidence" in value &&
    "needsReview" in value
  );
}

function extractPrimitive(field: unknown): any {
  if (isOCRField(field)) return field.value;
  return field;
}

function extractConfidence(field: unknown): number | null {
  if (isOCRField(field)) return field.confidence;
  return null;
}

function extractNeedsReview(field: unknown): boolean | null {
  if (isOCRField(field)) return field.needsReview;
  return null;
}

function getConfidenceLabel(score: number): "High" | "Medium" | "Low" {
  if (score >= 0.8) return "High";
  if (score >= 0.6) return "Medium";
  return "Low";
}

// ─── Float / Number Extraction ───────────────────────────────────────────────

function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

const DATE_FIELDS = new Set(["dob", "joiningDate", "confirmationDate"]);
const IMAGE_FIELDS = new Set(["photo", "photoBase64"]);

/**
 * Maps a raw OCR API response (with OCRConfidence objects) to:
 *  1. StaffFormData with primitive values only (no [object Object])
 *  2. OCRMetaData with confidence info per field
 *
 * Usage in form OCR handler:
 *   const { staffFormData, ocrMetadata } = mapOCRToStaffForm(result.data);
 *   setForm(staffFormData);            // Binds to inputs
 *   setOcrMeta(ocrMetadata);           // For confidence indicators
 */
export function mapOCRToStaffForm(
  ocrResponse: Record<string, unknown>
): {
  staffFormData: StaffFormData;
  ocrMetadata: OCRMetaData;
} {
  const raw: Record<string, any> = ocrResponse ?? {};
  const metadata: OCRMetaData = {};

  // Helper: extract primitive value AND record metadata
  const resolve = (key: string): any => {
    const field = raw[key];
    const primitive = extractPrimitive(field);
    const confidence = extractConfidence(field);
    const needsReview = extractNeedsReview(field);

    if (confidence !== null) {
      metadata[key] = {
        confidence: {
          value: confidence,
          label: getConfidenceLabel(confidence),
        },
        needsReview: needsReview ?? false,
      };
    }

    // Date conversion
    if (DATE_FIELDS.has(key) && typeof primitive === "string") {
      return toDateInputFormat(primitive);
    }

    // Handle image fields (already base64 strings, not OCR objects)
    if (IMAGE_FIELDS.has(key)) {
      return primitive ?? "";
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
        confidence: {
          value: confidence,
          label: getConfidenceLabel(confidence),
        },
        needsReview: needsReview ?? false,
      };
    }

    return toNumber(primitive);
  };

  // Resolve photoBase64 at the top level (it's a primitive in the OCR response)
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
