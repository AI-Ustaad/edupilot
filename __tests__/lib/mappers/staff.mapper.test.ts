// __tests__/lib/mappers/staff.mapper.test.ts
import { mapOCRToStaffForm } from "@/lib/mappers/staff.mapper";

describe("mapOCRToStaffForm()", () => {
  // ─── Basic mapping ──────────────────────────────────────────────────

  it("returns empty form data for empty input", () => {
    const { staffFormData, ocrMetadata } = mapOCRToStaffForm({});

    expect(staffFormData.personal.fullName).toBe("");
    expect(staffFormData.contact.mobile).toBe("");
    expect(staffFormData.professional.designation).toBe("");
    expect(staffFormData.payroll.basicSalary).toBe(0);
    expect(staffFormData.academic.subjects).toEqual([]);
    expect(staffFormData.emergency.name).toBe("");
    expect(staffFormData.documents.cv).toBe("");
    expect(ocrMetadata).toEqual({});
  });

  it("returns empty form data for null/undefined input", () => {
    const { staffFormData } = mapOCRToStaffForm(null as unknown as Record<string, unknown>);
    expect(staffFormData.personal.fullName).toBe("");
    expect(staffFormData.contact.email).toBe("");
  });

  it("extracts primitive values from flat fields", () => {
    const { staffFormData, ocrMetadata } = mapOCRToStaffForm({
      fullName: "John Doe",
      designation: "Teacher",
      email: "john@school.com",
    });

    expect(staffFormData.personal.fullName).toBe("John Doe");
    expect(staffFormData.professional.designation).toBe("Teacher");
    expect(staffFormData.contact.email).toBe("john@school.com");
    expect(ocrMetadata).toEqual({});
  });

  // ─── OCRConfidence object mapping ────────────────────────────────────

  it("extracts primitive values from OCRConfidence objects", () => {
    const { staffFormData, ocrMetadata } = mapOCRToStaffForm({
      fullName: { value: "John Doe", confidence: 0.95, needsReview: false },
      designation: { value: "Math Teacher", confidence: 0.7, needsReview: true },
      email: { value: "john@school.com", confidence: 0.4, needsReview: true },
    });

    expect(staffFormData.personal.fullName).toBe("John Doe");
    expect(staffFormData.professional.designation).toBe("Math Teacher");
    expect(staffFormData.contact.email).toBe("john@school.com");
  });

  it("builds correct OCR metadata", () => {
    const { ocrMetadata } = mapOCRToStaffForm({
      fullName: { value: "John Doe", confidence: 0.95, needsReview: false },
      designation: { value: "Math Teacher", confidence: 0.7, needsReview: true },
      email: { value: "john@school.com", confidence: 0.4, needsReview: false },
    });

    expect(ocrMetadata.fullName).toEqual({
      confidence: { value: 0.95, label: "High" },
      needsReview: false,
    });
    expect(ocrMetadata.designation).toEqual({
      confidence: { value: 0.7, label: "Medium" },
      needsReview: true,
    });
    expect(ocrMetadata.email).toEqual({
      confidence: { value: 0.4, label: "Low" },
      needsReview: false,
    });
  });

  // ─── Date normalization ──────────────────────────────────────────────

  it("normalizes dob to yyyy-MM-dd", () => {
    const { staffFormData } = mapOCRToStaffForm({
      dob: "15-03-1990",
      joiningDate: "2024/01/01",
      confirmationDate: "01/15/2025",
    });

    expect(staffFormData.personal.dob).toBe("1990-03-15");
    expect(staffFormData.professional.joiningDate).toBe("2024-01-01");
    expect(staffFormData.professional.confirmationDate).toBe("2025-01-15");
  });

  it("handles OCR-wrapped date fields", () => {
    const { staffFormData } = mapOCRToStaffForm({
      dob: { value: "15/03/1990", confidence: 0.9, needsReview: false },
    });

    expect(staffFormData.personal.dob).toBe("1990-03-15");
  });

  // ─── Numeric fields ─────────────────────────────────────────────────

  it("extracts numeric salary fields", () => {
    const { staffFormData } = mapOCRToStaffForm({
      basicSalary: { value: "50,000", confidence: 0.85, needsReview: false },
      grossPay: { value: "75,000", confidence: 0.8, needsReview: false },
    });

    expect(staffFormData.payroll.basicSalary).toBe(50000);
    expect(staffFormData.payroll.grossSalary).toBe(75000);
  });

  it("uses grossPay as fallback for grossSalary", () => {
    // grossPay is checked with || so if grossSalary is 0, grossPay is used
    const { staffFormData } = mapOCRToStaffForm({
      grossSalary: 0,
      grossPay: 100000,
    });

    expect(staffFormData.payroll.grossSalary).toBe(100000);
  });

  it("uses phone as fallback for mobile", () => {
    const { staffFormData } = mapOCRToStaffForm({
      phone: "0300-1234567",
    });

    expect(staffFormData.contact.mobile).toBe("0300-1234567");
  });

  it("uses phone as primary before mobile fallback", () => {
    const { staffFormData } = mapOCRToStaffForm({
      phone: "0300-1111111",
      mobile: "0300-0000000",
    });

    // phone is the primary field, mobile is fallback
    expect(staffFormData.contact.mobile).toBe("0300-1111111");
  });

  // ─── Fallback keys ─────────────────────────────────────────────────

  it("uses emergencyName as primary emergency contact", () => {
    const { staffFormData } = mapOCRToStaffForm({
      emergencyName: "Jane Doe",
      emergencyContact: "Jane D.",
    });

    expect(staffFormData.emergency.name).toBe("Jane Doe");
  });

  it("falls back to emergencyContact for emergency name", () => {
    const { staffFormData } = mapOCRToStaffForm({
      emergencyContact: "Jane D.",
    });

    expect(staffFormData.emergency.name).toBe("Jane D.");
  });

  // ─── Photo handling ────────────────────────────────────────────────

  it("extracts photoBase64", () => {
    const { staffFormData } = mapOCRToStaffForm({
      photoBase64: "data:image/png;base64,abc123",
    });

    expect(staffFormData.personal.photo).toBe("data:image/png;base64,abc123");
  });

  it("handles missing photo", () => {
    const { staffFormData } = mapOCRToStaffForm({});

    expect(staffFormData.personal.photo).toBe("");
  });

  // ─── Metadata only for OCR fields ───────────────────────────────────

  it("does not create metadata for primitive-only fields", () => {
    const { ocrMetadata } = mapOCRToStaffForm({
      fullName: "John Doe",
      email: "john@school.com",
    });

    expect(Object.keys(ocrMetadata).length).toBe(0);
  });

  it("creates metadata only for OCRConfidence fields", () => {
    const { ocrMetadata } = mapOCRToStaffForm({
      fullName: { value: "John Doe", confidence: 0.9, needsReview: false },
      email: "john@school.com", // primitive — no metadata
    });

    expect(ocrMetadata.fullName).toBeDefined();
    expect(ocrMetadata.email).toBeUndefined();
  });

  // ─── Edge cases ─────────────────────────────────────────────────────

  it("handles mixed OCR and primitive fields", () => {
    const { staffFormData, ocrMetadata } = mapOCRToStaffForm({
      fullName: { value: "John Doe", confidence: 0.9, needsReview: false },
      email: "primitive@email.com",
      phone: { value: "123-456-7890", confidence: 0.6, needsReview: true },
    });

    expect(staffFormData.personal.fullName).toBe("John Doe");
    expect(staffFormData.contact.email).toBe("primitive@email.com");
    expect(staffFormData.contact.mobile).toBe("123-456-7890");

    expect(ocrMetadata.fullName).toBeDefined();
    expect(ocrMetadata.phone).toBeDefined();
    expect(ocrMetadata.email).toBeUndefined();
  });

  it("handles undefined field values gracefully", () => {
    const { staffFormData } = mapOCRToStaffForm({
      fullName: undefined,
      designation: { value: undefined, confidence: 0.5, needsReview: false },
    });

    expect(staffFormData.personal.fullName).toBe("");
    expect(staffFormData.professional.designation).toBe("");
  });

  it("preserves empty array for allowances and deductions", () => {
    const { staffFormData } = mapOCRToStaffForm({
      basicSalary: 50000,
    });

    expect(staffFormData.payroll.allowances).toEqual([]);
    expect(staffFormData.payroll.deductions).toEqual([]);
  });

  it("sets default values for academic section", () => {
    const { staffFormData } = mapOCRToStaffForm({});

    expect(staffFormData.academic.subjects).toEqual([]);
    expect(staffFormData.academic.classesAssigned).toEqual([]);
    expect(staffFormData.academic.timetable).toBe("");
    expect(staffFormData.academic.sectionAssignment).toBe("");
    expect(staffFormData.academic.classTeacher).toBe(false);
  });

  // ─── Full pipeline integration ──────────────────────────────────────

  it("maps a complete OCR response correctly", () => {
    const response = {
      fullName: { value: "Dr. Sarah Ahmed", confidence: 0.97, needsReview: false },
      fatherName: { value: "Mohammad Ahmed", confidence: 0.9, needsReview: false },
      cnic: { value: "42101-1234567-1", confidence: 0.85, needsReview: true },
      dob: { value: "15-03-1985", confidence: 0.8, needsReview: false },
      gender: { value: "Female", confidence: 0.99, needsReview: false },
      phone: { value: "0300-1234567", confidence: 0.9, needsReview: false },
      email: { value: "sarah@school.com", confidence: 0.95, needsReview: false },
      designation: { value: "Principal", confidence: 0.96, needsReview: false },
      department: { value: "Administration", confidence: 0.92, needsReview: false },
      basicSalary: { value: "150,000", confidence: 0.88, needsReview: false },
      grossPay: { value: "200,000", confidence: 0.85, needsReview: false },
      joiningDate: { value: "15/01/2020", confidence: 0.9, needsReview: false },
    };

    const { staffFormData, ocrMetadata } = mapOCRToStaffForm(response);

    // Personal
    expect(staffFormData.personal.fullName).toBe("Dr. Sarah Ahmed");
    expect(staffFormData.personal.fatherName).toBe("Mohammad Ahmed");
    expect(staffFormData.personal.cnic).toBe("42101-1234567-1");
    expect(staffFormData.personal.gender).toBe("Female");
    expect(staffFormData.personal.nationality).toBe("");

    // Contact
    expect(staffFormData.contact.mobile).toBe("0300-1234567");
    expect(staffFormData.contact.email).toBe("sarah@school.com");

    // Professional
    expect(staffFormData.professional.designation).toBe("Principal");
    expect(staffFormData.professional.department).toBe("Administration");

    // Payroll
    expect(staffFormData.payroll.basicSalary).toBe(150000);
    expect(staffFormData.payroll.grossSalary).toBe(200000);

    // Date normalization
    expect(staffFormData.personal.dob).toBe("1985-03-15");
    expect(staffFormData.professional.joiningDate).toBe("2020-01-15");

    // Metadata
    expect(ocrMetadata.fullName.confidence.label).toBe("High");
    expect(ocrMetadata.cnic.needsReview).toBe(true);
    expect(ocrMetadata.phone.confidence.value).toBe(0.9);
  });
});
