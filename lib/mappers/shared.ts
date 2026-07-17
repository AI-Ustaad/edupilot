// lib/mappers/shared.ts
// Shared helper utilities for all domain mappers
// Reused by: staff.mapper.ts, student.mapper.ts (and future mappers)

import { OCRConfidence } from "@/types/ocr";

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
export function toDateInputFormat(value: string): string {
  if (!value) return "";

  // Already yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // Match two-digit separators: any of - / .
  const sepMatch = value.match(/^(\d{2})([-/.])(\d{2})\2(\d{4})$/);
  if (sepMatch) {
    const [, a, , b, year] = sepMatch;
    const aNum = parseInt(a, 10);
    const bNum = parseInt(b, 10);

    // Heuristic to detect dd/MM/yyyy vs MM/dd/yyyy:
    // - If first part > 12 → must be day (dd/MM)
    // - If second part > 12 → must be day (MM/dd, US format)
    // - Both ≤ 12 → default to dd/MM (European)
    if (aNum > 12) {
      // dd/MM/yyyy
      return `${year}-${b}-${a}`;
    } else if (bNum > 12) {
      // MM/dd/yyyy (US format)
      return `${year}-${a}-${b}`;
    }
    // Both ≤ 12 → ambiguous, default to dd/MM/yyyy
    return `${year}-${b}-${a}`;
  }

  // yyyy/MM/dd or yyyy.MM.dd
  const match2 = value.match(/^(\d{4})[-/.]?(\d{2})[-/.]?(\d{2})$/);
  if (match2) {
    const [, year, month, day] = match2;
    return `${year}-${month}-${day}`;
  }

  // Fallback: try JS Date parsing
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    // Use local time methods to preserve the intended date
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return value;
}

// ─── OCR Field Detection ─────────────────────────────────────────────────────

export function isOCRField(value: unknown): value is OCRConfidence {
  return (
    value !== null &&
    typeof value === "object" &&
    "value" in value &&
    "confidence" in value &&
    "needsReview" in value
  );
}

export function extractPrimitive(field: unknown): any {
  if (isOCRField(field)) return field.value;
  return field;
}

export function extractConfidence(field: unknown): number | null {
  if (isOCRField(field)) return field.confidence;
  return null;
}

export function extractNeedsReview(field: unknown): boolean | null {
  if (isOCRField(field)) return field.needsReview;
  return null;
}

export function getConfidenceLabel(score: number): "High" | "Medium" | "Low" {
  if (score >= 0.8) return "High";
  if (score >= 0.6) return "Medium";
  return "Low";
}

// ─── Number Extraction ───────────────────────────────────────────────────────

export function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    // Remove commas and spaces (thousand separators)
    const cleaned = val.replace(/[,\s]/g, "");
    // Find the last dot — potential decimal separator
    const dotIndex = cleaned.lastIndexOf(".");
    // Only treat as decimal if digit on both sides of the dot
    const hasValidDecimal =
      dotIndex > 0 &&
      /\d/.test(cleaned[dotIndex - 1]) &&
      /\d/.test(cleaned.substring(dotIndex + 1) || "");

    const allDigits = cleaned.replace(/[^0-9]/g, "");
    if (allDigits.length === 0) return 0;

    if (hasValidDecimal) {
      const beforeDot = cleaned.substring(0, dotIndex);
      const digitsBeforeDot = beforeDot.replace(/[^0-9]/g, "") || "0";
      const decPart = cleaned.substring(dotIndex + 1).replace(/[^0-9]/g, "");
      const n = parseFloat(digitsBeforeDot + "." + decPart);
      return isNaN(n) ? 0 : n;
    }

    const n = parseFloat(allDigits);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}
