// __tests__/lib/mappers/shared.test.ts
import {
  toDateInputFormat,
  isOCRField,
  extractPrimitive,
  extractConfidence,
  extractNeedsReview,
  getConfidenceLabel,
  toNumber,
  OCRConfidenceInfo,
  OCRFieldMeta,
  OCRMetaData,
} from "@/lib/mappers/shared";

// ─── toDateInputFormat ───────────────────────────────────────────────────────

describe("toDateInputFormat()", () => {
  it("returns empty string for falsy input", () => {
    expect(toDateInputFormat("")).toBe("");
    expect(toDateInputFormat(null as unknown as string)).toBe("");
    expect(toDateInputFormat(undefined as unknown as string)).toBe("");
  });

  it("passes through yyyy-MM-dd unchanged", () => {
    expect(toDateInputFormat("2024-03-15")).toBe("2024-03-15");
  });

  it("converts dd-MM-yyyy", () => {
    expect(toDateInputFormat("15-03-2024")).toBe("2024-03-15");
  });

  it("converts dd/MM/yyyy", () => {
    expect(toDateInputFormat("15/03/2024")).toBe("2024-03-15");
  });

  it("converts dd.MM.yyyy", () => {
    expect(toDateInputFormat("15.03.2024")).toBe("2024-03-15");
  });

  it("converts yyyy/MM/dd", () => {
    expect(toDateInputFormat("2024/03/15")).toBe("2024-03-15");
  });

  it("converts yyyy.MM.dd", () => {
    expect(toDateInputFormat("2024.03.15")).toBe("2024-03-15");
  });

  it("converts MM/dd/yyyy US format (day > 12)", () => {
    // day=15 > 12, month=03 → US format detected
    expect(toDateInputFormat("03/15/2024")).toBe("2024-03-15");
  });

  it("converts MM/dd/yyyy when month=12, day=25", () => {
    expect(toDateInputFormat("12/25/2024")).toBe("2024-12-25");
  });

  it("detects dd/MM/yyyy when day > 12", () => {
    // day=15 > 12, month=03 → dd/MM/yyyy
    expect(toDateInputFormat("15/03/2024")).toBe("2024-03-15");
  });

  it("defaults to dd/MM/yyyy for ambiguous dates (both ≤ 12)", () => {
    // Both month and day ≤ 12 → ambiguous, default dd/MM
    expect(toDateInputFormat("03/04/2024")).toBe("2024-04-03");
  });

  it("handles edge: dd=01, mm=02 (ambiguous, parsed as dd-MM)", () => {
    // Both day and month ≤ 12 → handled by dd-MM branch first
    expect(toDateInputFormat("01-02-2024")).toBe("2024-02-01");
  });

  it("falls back to JS Date parsing for ISO strings", () => {
    const result = toDateInputFormat("2024-03-15T10:30:00Z");
    expect(result).toBe("2024-03-15");
  });

  it("falls back to JS Date parsing for human-readable dates", () => {
    const result = toDateInputFormat("March 15, 2024");
    expect(result).toBe("2024-03-15");
  });

  it("falls back to JS Date parsing for ISO datetime strings", () => {
    expect(toDateInputFormat("2024-03-15T00:00:00.000Z")).toBe("2024-03-15");
  });

  it("returns original value for unparseable strings", () => {
    expect(toDateInputFormat("not-a-date")).toBe("not-a-date");
  });

  it("handles single-digit parsing via JS Date fallback", () => {
    const result = toDateInputFormat("5-3-2024");
    // Non-standard format handled by JS Date fallback
    expect(result).toBeTruthy();
    expect(result.length).toBe(10); // yyyy-MM-dd
  });

  it("handles leap year date", () => {
    expect(toDateInputFormat("29-02-2024")).toBe("2024-02-29");
  });
});

// ─── isOCRField ──────────────────────────────────────────────────────────────

describe("isOCRField()", () => {
  it("returns true for valid OCRConfidence object", () => {
    expect(isOCRField({ value: "John", confidence: 0.95, needsReview: false })).toBe(true);
  });

  it("returns false for null", () => {
    expect(isOCRField(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isOCRField(undefined)).toBe(false);
  });

  it("returns false for primitive strings", () => {
    expect(isOCRField("John")).toBe(false);
  });

  it("returns false for numbers", () => {
    expect(isOCRField(42)).toBe(false);
  });

  it("returns false for objects missing confidence", () => {
    expect(isOCRField({ value: "John" })).toBe(false);
  });

  it("returns false for objects missing needsReview", () => {
    expect(isOCRField({ value: "John", confidence: 0.9 })).toBe(false);
  });

  it("returns false for empty object", () => {
    expect(isOCRField({})).toBe(false);
  });

  it("returns false for arrays", () => {
    expect(isOCRField(["value", 0.9, false])).toBe(false);
  });
});

// ─── extractPrimitive ────────────────────────────────────────────────────────

describe("extractPrimitive()", () => {
  it("extracts value from OCRConfidence object", () => {
    expect(extractPrimitive({ value: "John", confidence: 0.9, needsReview: false })).toBe("John");
  });

  it("returns primitive as-is when not OCR field", () => {
    expect(extractPrimitive("John")).toBe("John");
  });

  it("returns null when field is null", () => {
    expect(extractPrimitive(null)).toBe(null);
  });

  it("returns undefined when field is undefined", () => {
    expect(extractPrimitive(undefined)).toBe(undefined);
  });

  it("extracts numeric value from OCRConfidence", () => {
    expect(extractPrimitive({ value: 50000, confidence: 0.85, needsReview: false })).toBe(50000);
  });

  it("extracts boolean value from OCRConfidence", () => {
    expect(extractPrimitive({ value: true, confidence: 1.0, needsReview: false })).toBe(true);
  });
});

// ─── extractConfidence ──────────────────────────────────────────────────────

describe("extractConfidence()", () => {
  it("extracts confidence from OCRConfidence object", () => {
    expect(extractConfidence({ value: "John", confidence: 0.95, needsReview: false })).toBe(0.95);
  });

  it("returns null for primitive values", () => {
    expect(extractConfidence("John")).toBe(null);
  });

  it("returns null for undefined", () => {
    expect(extractConfidence(undefined)).toBe(null);
  });
});

// ─── extractNeedsReview ─────────────────────────────────────────────────────

describe("extractNeedsReview()", () => {
  it("extracts needsReview from OCRConfidence object", () => {
    expect(extractNeedsReview({ value: "John", confidence: 0.9, needsReview: true })).toBe(true);
    expect(extractNeedsReview({ value: "John", confidence: 0.9, needsReview: false })).toBe(false);
  });

  it("returns null for primitive values", () => {
    expect(extractNeedsReview("John")).toBe(null);
  });
});

// ─── getConfidenceLabel ─────────────────────────────────────────────────────

describe("getConfidenceLabel()", () => {
  it("returns High for score >= 0.8", () => {
    expect(getConfidenceLabel(0.8)).toBe("High");
    expect(getConfidenceLabel(0.95)).toBe("High");
    expect(getConfidenceLabel(1.0)).toBe("High");
  });

  it("returns Medium for score 0.6–0.79", () => {
    expect(getConfidenceLabel(0.6)).toBe("Medium");
    expect(getConfidenceLabel(0.79)).toBe("Medium");
    expect(getConfidenceLabel(0.7)).toBe("Medium");
  });

  it("returns Low for score < 0.6", () => {
    expect(getConfidenceLabel(0.59)).toBe("Low");
    expect(getConfidenceLabel(0.0)).toBe("Low");
    expect(getConfidenceLabel(0.3)).toBe("Low");
  });
});

// ─── toNumber ────────────────────────────────────────────────────────────────

describe("toNumber()", () => {
  it("returns number as-is", () => {
    expect(toNumber(42)).toBe(42);
    expect(toNumber(0)).toBe(0);
    expect(toNumber(-5)).toBe(-5);
    expect(toNumber(3.14)).toBe(3.14);
  });

  it("parses numeric string", () => {
    expect(toNumber("50000")).toBe(50000);
    expect(toNumber("3.14")).toBe(3.14);
  });

  it("strips non-numeric characters from string", () => {
    expect(toNumber("Rs. 50,000")).toBe(50000);
    expect(toNumber("$1,234.56")).toBe(1234.56);
    expect(toNumber("Salary: 75000 PKR")).toBe(75000);
  });

  it("handles multiple dots by keeping last as decimal", () => {
    expect(toNumber("1.234.56")).toBe(1234.56);
    expect(toNumber("1,234.56")).toBe(1234.56);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(toNumber("abc")).toBe(0);
    expect(toNumber("")).toBe(0);
  });

  it("returns 0 for null/undefined", () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });

  it("returns 0 for objects", () => {
    expect(toNumber({})).toBe(0);
    expect(toNumber({ value: 100 })).toBe(0);
  });

  it("returns 0 for booleans", () => {
    expect(toNumber(true)).toBe(0);
    expect(toNumber(false)).toBe(0);
  });
});
