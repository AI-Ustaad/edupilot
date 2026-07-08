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
    if (monthNum >= 1 && monthNum <= 12 && dayNum > 12 && dayNum <= 31) {
      return `${y}-${m}-${d}`;
    }
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
    const cleaned = val.replace(/[^0-9.]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}
