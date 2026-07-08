// lib/mappers/student.mapper.ts
// OCR/API → StudentForm mapper: converts raw API/OCR responses into primitive-only form data
// NEVER bind raw API/OCR objects directly to React inputs

import {
  toDateInputFormat,
  extractPrimitive,
  extractConfidence,
  extractNeedsReview,
  getConfidenceLabel,
  toNumber,
  OCRMetaData,
} from "./shared";

// ─── Student Form Data Types ────────────────────────────────────────────────

export interface StudentFormData {
  fullName: string;
  fatherName: string;
  cnic: string;
  dob: string; // yyyy-MM-dd for <input type="date">
  gender: string;
  bloodGroup: string;
  religion: string;
  nationality: string;
  phone: string;
  email: string;
  address: string;
  classGrade: string;
  section: string;
  rollNumber: string;
  admissionNumber: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  previousSchool: string;
  medicalConditions: string;
  photoBase64: string;
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

const DATE_FIELDS = new Set(["dob", "dateOfBirth"]);

/**
 * Maps a raw OCR/API response (may contain OCRConfidence objects or primitive values) to:
 *  1. StudentFormData with primitive values only (no [object Object])
 *  2. OCRMetaData with confidence info per field (if OCRConfidence objects detected)
 *
 * Usage:
 *   const { studentFormData, ocrMetadata } = mapOCRToStudentForm(apiResponse);
 *   setForm(studentFormData);
 */
export function mapOCRToStudentForm(
  apiResponse: Record<string, unknown>
): {
  studentFormData: StudentFormData;
  ocrMetadata: OCRMetaData;
} {
  const raw: Record<string, any> = apiResponse ?? {};
  const metadata: OCRMetaData = {};

  const resolve = (key: string, ...fallbackKeys: string[]): string => {
    // Try primary key first, then fallbacks
    const keys = [key, ...fallbackKeys];
    for (const k of keys) {
      const field = raw[k];
      if (field === undefined || field === null) continue;

      const primitive = extractPrimitive(field);
      const confidence = extractConfidence(field);
      const needsReview = extractNeedsReview(field);

      if (confidence !== null) {
        metadata[k] = {
          confidence: { value: confidence, label: getConfidenceLabel(confidence) },
          needsReview: needsReview ?? false,
        };
      }

      if (DATE_FIELDS.has(k) && typeof primitive === "string") {
        return toDateInputFormat(primitive);
      }

      const str = String(primitive ?? "").trim();
      if (str.length > 0) return str;
    }
    return "";
  };

  const resolveNumStr = (key: string, ...fallbackKeys: string[]): string => {
    const keys = [key, ...fallbackKeys];
    for (const k of keys) {
      const field = raw[k];
      if (field === undefined || field === null) continue;

      const primitive = extractPrimitive(field);
      const confidence = extractConfidence(field);
      const needsReview = extractNeedsReview(field);

      if (confidence !== null) {
        metadata[k] = {
          confidence: { value: confidence, label: getConfidenceLabel(confidence) },
          needsReview: needsReview ?? false,
        };
      }

      const num = toNumber(primitive);
      if (num > 0) return String(num);
    }
    return "";
  };

  const studentFormData: StudentFormData = {
    fullName: resolve("fullName", "studentName", "name"),
    fatherName: resolve("fatherName"),
    cnic: resolve("cnic", "bForm", "bFormNumber"),
    dob: resolve("dob", "dateOfBirth", "DOB"),
    gender: resolve("gender"),
    bloodGroup: resolve("bloodGroup"),
    religion: resolve("religion"),
    nationality: resolve("nationality"),
    phone: resolve("phone", "mobile", "guardianPhone", "parentPhone"),
    email: resolve("email"),
    address: resolve("address", "currentAddress", "permanentAddress"),
    classGrade: resolve("classGrade", "class", "grade"),
    section: resolve("section"),
    rollNumber: resolveNumStr("rollNumber", "rollNo"),
    admissionNumber: resolve("admissionNumber"),
    guardianName: resolve("guardianName", "parentName"),
    guardianRelation: resolve("guardianRelation", "guardianRelation"),
    guardianPhone: resolve("guardianPhone", "parentPhone"),
    previousSchool: resolve("previousSchool", "lastSchool"),
    medicalConditions: resolve("medicalConditions"),
    photoBase64: String(raw.photoBase64 ?? ""),
  };

  return { studentFormData, ocrMetadata: metadata };
}
