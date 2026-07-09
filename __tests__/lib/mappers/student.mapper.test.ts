// __tests__/lib/mappers/student.mapper.test.ts
import { mapOCRToStudentForm } from "@/lib/mappers/student.mapper";

describe("mapOCRToStudentForm()", () => {
  // ─── Basic mapping ──────────────────────────────────────────────────

  it("returns empty form data for empty input", () => {
    const { studentFormData, ocrMetadata } = mapOCRToStudentForm({});

    expect(studentFormData.fullName).toBe("");
    expect(studentFormData.fatherName).toBe("");
    expect(studentFormData.phone).toBe("");
    expect(studentFormData.email).toBe("");
    expect(studentFormData.rollNumber).toBe("");
    expect(studentFormData.photoBase64).toBe("");
    expect(ocrMetadata).toEqual({});
  });

  it("returns empty form data for null/undefined input", () => {
    const { studentFormData } = mapOCRToStudentForm(null as unknown as Record<string, unknown>);
    expect(studentFormData.fullName).toBe("");
    expect(studentFormData.classGrade).toBe("");
  });

  // ─── Primitive value extraction ─────────────────────────────────────

  it("extracts primitive values from flat fields", () => {
    const { studentFormData } = mapOCRToStudentForm({
      fullName: "Ali Khan",
      fatherName: "Mohammad Khan",
      gender: "Male",
      classGrade: "10",
      section: "A",
    });

    expect(studentFormData.fullName).toBe("Ali Khan");
    expect(studentFormData.fatherName).toBe("Mohammad Khan");
    expect(studentFormData.gender).toBe("Male");
    expect(studentFormData.classGrade).toBe("10");
    expect(studentFormData.section).toBe("A");
  });

  // ─── OCRConfidence object mapping ───────────────────────────────────

  it("extracts values from OCRConfidence objects", () => {
    const { studentFormData } = mapOCRToStudentForm({
      fullName: { value: "Ali Khan", confidence: 0.95, needsReview: false },
      fatherName: { value: "Mohammad Khan", confidence: 0.88, needsReview: false },
    });

    expect(studentFormData.fullName).toBe("Ali Khan");
    expect(studentFormData.fatherName).toBe("Mohammad Khan");
  });

  it("builds correct OCR metadata", () => {
    const { ocrMetadata } = mapOCRToStudentForm({
      fullName: { value: "Ali Khan", confidence: 0.95, needsReview: false },
      classGrade: { value: "10", confidence: 0.6, needsReview: true },
    });

    expect(ocrMetadata.fullName).toEqual({
      confidence: { value: 0.95, label: "High" },
      needsReview: false,
    });
    expect(ocrMetadata.classGrade).toEqual({
      confidence: { value: 0.6, label: "Medium" },
      needsReview: true,
    });
  });

  // ─── Fallback key resolution ────────────────────────────────────────

  it("tries fallback keys when primary key is missing", () => {
    const { studentFormData } = mapOCRToStudentForm({
      studentName: "Ali Khan",
      class: "10",
      mobile: "0300-1234567",
    });

    expect(studentFormData.fullName).toBe("Ali Khan");
    expect(studentFormData.classGrade).toBe("10");
    expect(studentFormData.phone).toBe("0300-1234567");
  });

  it("prefers primary key over fallbacks", () => {
    const { studentFormData } = mapOCRToStudentForm({
      fullName: "Primary Name",
      studentName: "Fallback Name",
      name: "Old Name",
    });

    expect(studentFormData.fullName).toBe("Primary Name");
  });

  it("falls back through multiple fallback keys", () => {
    const { studentFormData } = mapOCRToStudentForm({
      name: "Only Name Available",
    });

    expect(studentFormData.fullName).toBe("Only Name Available");
  });

  it("skips empty string fallbacks", () => {
    const { studentFormData } = mapOCRToStudentForm({
      fullName: "",
      studentName: "",
      name: "Last Resort",
    });

    expect(studentFormData.fullName).toBe("Last Resort");
  });

  it("handles cnic with bForm fallback", () => {
    const { studentFormData } = mapOCRToStudentForm({
      bForm: "42101-1234567-1",
    });

    expect(studentFormData.cnic).toBe("42101-1234567-1");
  });

  it("handles address with multiple fallbacks", () => {
    const { studentFormData } = mapOCRToStudentForm({
      permanentAddress: "House 12, Street 5",
    });

    expect(studentFormData.address).toBe("House 12, Street 5");
  });

  it("handles guardianName with parentName fallback", () => {
    const { studentFormData } = mapOCRToStudentForm({
      parentName: "Mr. Khan",
    });

    expect(studentFormData.guardianName).toBe("Mr. Khan");
  });

  // ─── Date normalization ─────────────────────────────────────────────

  it("normalizes dob from dd-MM-yyyy", () => {
    const { studentFormData } = mapOCRToStudentForm({
      dob: "15-03-2010",
    });

    expect(studentFormData.dob).toBe("2010-03-15");
  });

  it("normalizes dob from OCRConfidence", () => {
    const { studentFormData } = mapOCRToStudentForm({
      dateOfBirth: { value: "01/06/2009", confidence: 0.9, needsReview: false },
    });

    expect(studentFormData.dob).toBe("2009-06-01");
  });

  it("handles US format date for DOB", () => {
    const { studentFormData } = mapOCRToStudentForm({
      DOB: "06/15/2009",
    });

    expect(studentFormData.dob).toBe("2009-06-15");
  });

  // ─── Numeric string fields (rollNumber) ─────────────────────────────

  it("extracts rollNumber as string from numeric value", () => {
    const { studentFormData } = mapOCRToStudentForm({
      rollNumber: 1045,
    });

    expect(studentFormData.rollNumber).toBe("1045");
  });

  it("extracts rollNumber from OCRConfidence", () => {
    const { studentFormData } = mapOCRToStudentForm({
      rollNumber: { value: 1045, confidence: 0.9, needsReview: false },
    });

    expect(studentFormData.rollNumber).toBe("1045");
  });

  it("uses rollNo fallback for rollNumber", () => {
    const { studentFormData } = mapOCRToStudentForm({
      rollNo: 12,
    });

    expect(studentFormData.rollNumber).toBe("12");
  });

  // ─── Photo handling ────────────────────────────────────────────────

  it("extracts photoBase64", () => {
    const { studentFormData } = mapOCRToStudentForm({
      photoBase64: "data:image/jpg;base64,xyz789",
    });

    expect(studentFormData.photoBase64).toBe("data:image/jpg;base64,xyz789");
  });

  it("handles missing photoBase64", () => {
    const { studentFormData } = mapOCRToStudentForm({});

    expect(studentFormData.photoBase64).toBe("");
  });

  // ─── Metadata only for OCR fields ──────────────────────────────────

  it("does not create metadata for primitive-only fields", () => {
    const { ocrMetadata } = mapOCRToStudentForm({
      fullName: "Ali",
      fatherName: "Khan",
    });

    expect(Object.keys(ocrMetadata).length).toBe(0);
  });

  it("creates metadata only for fields where the resolved key is OCR", () => {
    const { ocrMetadata } = mapOCRToStudentForm({
      fullName: { value: "Ali", confidence: 0.9, needsReview: false },
      fatherName: "Khan", // primitive
    });

    expect(ocrMetadata.fullName).toBeDefined();
    expect(ocrMetadata.fatherName).toBeUndefined();
  });

  // ─── Edge cases ─────────────────────────────────────────────────────

  it("handles undefined/null field values", () => {
    const { studentFormData } = mapOCRToStudentForm({
      fullName: undefined,
      fatherName: null,
    });

    expect(studentFormData.fullName).toBe("");
    expect(studentFormData.fatherName).toBe("");
  });

  it("handles OCR fields with null value", () => {
    const { studentFormData, ocrMetadata } = mapOCRToStudentForm({
      fullName: { value: null, confidence: 0.9, needsReview: false },
    });

    expect(studentFormData.fullName).toBe("");
    expect(ocrMetadata.fullName).toBeDefined();
  });

  it("trims whitespace from string values", () => {
    const { studentFormData } = mapOCRToStudentForm({
      fullName: "  Ali Khan  ",
      email: "  ali@school.com  ",
    });

    expect(studentFormData.fullName).toBe("Ali Khan");
    expect(studentFormData.email).toBe("ali@school.com");
  });

  it("stops at first non-empty fallback key", () => {
    const { studentFormData } = mapOCRToStudentForm({
      phone: "",
      mobile: "",
      guardianPhone: "0300-7654321",
      parentPhone: "0300-1111111",
    });

    expect(studentFormData.phone).toBe("0300-7654321");
  });

  it("handles boolean false value correctly (does not treat as empty)", () => {
    // This tests that `if (str.length > 0)` doesn't drop actual data
    const { studentFormData } = mapOCRToStudentForm({
      previousSchool: "Previous School",
    });

    expect(studentFormData.previousSchool).toBe("Previous School");
  });

  // ─── Full pipeline integration ──────────────────────────────────────

  it("maps a complete OCR response correctly", () => {
    const response = {
      fullName: { value: "Ahmed Ali", confidence: 0.96, needsReview: false },
      fatherName: { value: "Mohammad Ali", confidence: 0.94, needsReview: false },
      cnic: { value: "42201-9876543-1", confidence: 0.82, needsReview: true },
      dob: { value: "12-05-2010", confidence: 0.9, needsReview: false },
      gender: { value: "Male", confidence: 0.99, needsReview: false },
      bloodGroup: { value: "O+", confidence: 0.85, needsReview: false },
      religion: { value: "Islam", confidence: 0.98, needsReview: false },
      nationality: { value: "Pakistani", confidence: 0.99, needsReview: false },
      phone: { value: "0300-9876543", confidence: 0.9, needsReview: false },
      email: { value: "ahmed@student.com", confidence: 0.93, needsReview: false },
      address: { value: "123 Main Street", confidence: 0.75, needsReview: true },
      classGrade: { value: "10", confidence: 0.97, needsReview: false },
      section: { value: "B", confidence: 0.95, needsReview: false },
      rollNumber: { value: 1001, confidence: 0.9, needsReview: false },
      guardianName: { value: "Mohammad Ali", confidence: 0.9, needsReview: false },
      guardianRelation: { value: "Father", confidence: 0.95, needsReview: false },
      previousSchool: { value: "City School", confidence: 0.7, needsReview: true },
      medicalConditions: { value: "Asthma", confidence: 0.8, needsReview: true },
      photoBase64: "data:image/png;base64,img001",
    };

    const { studentFormData, ocrMetadata } = mapOCRToStudentForm(response);

    // Primitive values
    expect(studentFormData.fullName).toBe("Ahmed Ali");
    expect(studentFormData.fatherName).toBe("Mohammad Ali");
    expect(studentFormData.cnic).toBe("42201-9876543-1");
    expect(studentFormData.gender).toBe("Male");
    expect(studentFormData.bloodGroup).toBe("O+");
    expect(studentFormData.religion).toBe("Islam");
    expect(studentFormData.nationality).toBe("Pakistani");
    expect(studentFormData.phone).toBe("0300-9876543");
    expect(studentFormData.email).toBe("ahmed@student.com");
    expect(studentFormData.address).toBe("123 Main Street");
    expect(studentFormData.classGrade).toBe("10");
    expect(studentFormData.section).toBe("B");
    expect(studentFormData.rollNumber).toBe("1001");
    expect(studentFormData.guardianName).toBe("Mohammad Ali");
    expect(studentFormData.guardianRelation).toBe("Father");
    expect(studentFormData.previousSchool).toBe("City School");
    expect(studentFormData.medicalConditions).toBe("Asthma");
    expect(studentFormData.photoBase64).toBe("data:image/png;base64,img001");

    // Date normalization
    expect(studentFormData.dob).toBe("2010-05-12");

    // Metadata
    expect(ocrMetadata.fullName.confidence.label).toBe("High");
    expect(ocrMetadata.cnic.needsReview).toBe(true);
    expect(ocrMetadata.phone.confidence.value).toBe(0.9);
    expect(ocrMetadata.address.needsReview).toBe(true);
    expect(ocrMetadata.address.confidence.label).toBe("Medium");
    expect(ocrMetadata.previousSchool.needsReview).toBe(true);
    expect(ocrMetadata.medicalConditions.needsReview).toBe(true);

    // Metadata count (all OCR fields should have metadata)
    const ocrCount = Object.keys(response).filter(
      (k) => k !== "photoBase64" && typeof response[k as keyof typeof response] === "object"
    ).length;
    expect(Object.keys(ocrMetadata).length).toBe(ocrCount);
  });
});
