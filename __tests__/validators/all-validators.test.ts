// __tests__/validators/all-validators.test.ts
// Comprehensive tests for all Zod validator schemas covering:
// Staff, Student, Fees, Attendance, Marks, Parent, Timetable

import {
  CreateStaffSchema,
  UpdateStaffSchema,
  BulkImportRowSchema as StaffBulkRowSchema,
  BulkImportFileSchema as StaffBulkFileSchema,
  OCRFileSchema as StaffOCRFileSchema,
  OCRExtractedSchema as StaffOCRExtractedSchema,
} from "@/validators/staff";

import {
  CreateStudentSchema,
  UpdateStudentSchema,
} from "@/dto";

import {
  CreateFeeSchema,
  UpdateFeeSchema,
} from "@/validators/fees";

import {
  MarkAttendanceSchema,
  BulkAttendanceSchema,
  GetAttendanceQuerySchema,
} from "@/validators/attendance";

import {
  SaveMarkSchema,
  BulkPublishSchema,
  SkillsSchema,
  GetMarksQuerySchema,
} from "@/validators/marks";

import {
  CreateParentSchema,
} from "@/validators/parent";

import {
  CreateTimetableEntrySchema,
} from "@/validators/timetable";

// ═════════════════════════════════════════════════════════════════════════════
// STAFF VALIDATORS
// ═════════════════════════════════════════════════════════════════════════════

describe("CreateStaffSchema", () => {
  it("accepts valid staff data", () => {
    const result = CreateStaffSchema.parse({
      personal: {
        fullName: "John Doe",
        fatherName: "Mr. Doe",
        cnic: "42101-1234567-1",
        gender: "Male",
        maritalStatus: "Married",
      },
      contact: {
        mobile: "0300-1234567",
        email: "john@school.com",
        city: "Lahore",
      },
      professional: {
        personnelNo: "EMP001",
        designation: "Teacher",
      },
    });

    expect(result.personal.fullName).toBe("John Doe");
    expect(result.personal.gender).toBe("Male");
    expect(result.contact.email).toBe("john@school.com");
    expect(result.professional.personnelNo).toBe("EMP001");
  });

  it("rejects missing fullName in personal", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "A" },
        professional: { personnelNo: "1", designation: "T" },
      })
    ).toThrow();
  });

  it("rejects invalid gender", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "John Doe", gender: "Unknown" },
        professional: { personnelNo: "1", designation: "T" },
      })
    ).toThrow();
  });

  it("rejects missing personnelNo", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "John Doe" },
        professional: { designation: "Teacher" },
      })
    ).toThrow();
  });

  it("accepts only required fields", () => {
    const result = CreateStaffSchema.parse({
      personal: { fullName: "John Doe" },
      contact: { },
      professional: { personnelNo: "1", designation: "T" },
    });
    expect(result.personal.fatherName).toBeUndefined();
    expect(result.contact.country).toBeUndefined();
  });

  it("validates email format", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "John Doe" },
        professional: { personnelNo: "1", designation: "T" },
        contact: { email: "not-an-email" },
      })
    ).toThrow();
  });

  it("accepts empty string email", () => {
    const result = CreateStaffSchema.parse({
      personal: { fullName: "John Doe" },
      professional: { personnelNo: "1", designation: "T" },
      contact: { email: "" },
    });
    expect(result.contact.email).toBe("");
  });

  it("rejects negative salary", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "John Doe" },
        contact: { },
        professional: { personnelNo: "1", designation: "T" },
        payroll: { basicSalary: -100 },
      })
    ).toThrow();
  });

  it("accepts empty payroll", () => {
    const result = CreateStaffSchema.parse({
      personal: { fullName: "John Doe" },
      contact: { },
      professional: { personnelNo: "1", designation: "T" },
    });
    expect(result.payroll).toBeUndefined();
  });

  it("accepts empty allowances array", () => {
    const result = CreateStaffSchema.parse({
      personal: { fullName: "John Doe" },
      contact: {},
      professional: { personnelNo: "1", designation: "T" },
      payroll: { allowances: [] },
    });
    expect(result.payroll?.allowances).toEqual([]);
  });

  it("accepts empty deductions array", () => {
    const result = CreateStaffSchema.parse({
      personal: { fullName: "John Doe" },
      contact: {},
      professional: { personnelNo: "1", designation: "T" },
      payroll: { deductions: [] },
    });
    expect(result.payroll?.deductions).toEqual([]);
  });

  it("accepts one valid allowance", () => {
    const result = CreateStaffSchema.parse({
      personal: { fullName: "John Doe" },
      contact: {},
      professional: { personnelNo: "1", designation: "T" },
      payroll: { allowances: [{ name: "House Rent", amount: 15000 }] },
    });
    expect(result.payroll?.allowances).toEqual([{ name: "House Rent", amount: 15000 }]);
  });

  it("accepts one valid deduction", () => {
    const result = CreateStaffSchema.parse({
      personal: { fullName: "John Doe" },
      contact: {},
      professional: { personnelNo: "1", designation: "T" },
      payroll: { deductions: [{ name: "Tax", amount: 5000 }] },
    });
    expect(result.payroll?.deductions).toEqual([{ name: "Tax", amount: 5000 }]);
  });

  it("rejects allowance missing name", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "John Doe" },
        contact: {},
        professional: { personnelNo: "1", designation: "T" },
        payroll: { allowances: [{ name: "", amount: 1000 }] },
      })
    ).toThrow();
  });

  it("rejects deduction missing name", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "John Doe" },
        contact: {},
        professional: { personnelNo: "1", designation: "T" },
        payroll: { deductions: [{ name: "", amount: 1000 }] },
      })
    ).toThrow();
  });

  it("leaves missing allowances/deductions as undefined (no .default([]))", () => {
    const result = CreateStaffSchema.parse({
      personal: { fullName: "John Doe" },
      contact: {},
      professional: { personnelNo: "1", designation: "T" },
      payroll: {},
    });
    expect(result.payroll?.allowances).toBeUndefined();
    expect(result.payroll?.deductions).toBeUndefined();
  });

  it("rejects negative allowance amount", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "John Doe" },
        contact: {},
        professional: { personnelNo: "1", designation: "T" },
        payroll: { allowances: [{ name: "Bonus", amount: -100 }] },
      })
    ).toThrow();
  });

  it("rejects negative deduction amount", () => {
    expect(() =>
      CreateStaffSchema.parse({
        personal: { fullName: "John Doe" },
        contact: {},
        professional: { personnelNo: "1", designation: "T" },
        payroll: { deductions: [{ name: "Tax", amount: -500 }] },
      })
    ).toThrow();
  });
});

describe("UpdateStaffSchema", () => {
  it("accepts partial updates", () => {
    const result = UpdateStaffSchema.parse({
      personal: { fullName: "Updated Name" },
    });
    expect(result.personal?.fullName).toBe("Updated Name");
  });

  it("accepts empty object (partial)", () => {
    const result = UpdateStaffSchema.parse({});
    expect(result).toEqual({});
  });
});

describe("Staff BulkImportRowSchema", () => {
  it("accepts valid bulk row", () => {
    const result = StaffBulkRowSchema.parse({
      fullName: "John Doe",
      designation: "Teacher",
      basicSalary: 50000,
    });
    expect(result.fullName).toBe("John Doe");
  });

  it("rejects missing fullName", () => {
    expect(() => StaffBulkRowSchema.parse({ designation: "T" })).toThrow();
  });

  it("rejects missing designation", () => {
    expect(() => StaffBulkRowSchema.parse({ fullName: "John" })).toThrow();
  });
});

describe("Staff BulkImportFileSchema", () => {
  it("accepts array of rows", () => {
    const result = StaffBulkFileSchema.parse({
      rows: [{ fullName: "John", designation: "T" }],
    });
    expect(result.rows).toHaveLength(1);
  });

  it("rejects empty rows array", () => {
    expect(() => StaffBulkFileSchema.parse({ rows: [] })).toThrow("At least one row is required");
  });
});

describe("Staff OCRFileSchema", () => {
  it("accepts valid image mime types", () => {
    const result = StaffOCRFileSchema.parse({
      mimeType: "image/png",
      size: 1_000_000,
      extension: "png",
    });
    expect(result.mimeType).toBe("image/png");
  });

  it("rejects unsupported mime type", () => {
    expect(() =>
      StaffOCRFileSchema.parse({
        mimeType: "image/gif",
        size: 1000,
        extension: "gif",
      })
    ).toThrow();
  });

  it("rejects oversized file (over 4MB)", () => {
    expect(() =>
      StaffOCRFileSchema.parse({
        mimeType: "image/jpeg",
        size: 5_000_000,
        extension: "jpeg",
      })
    ).toThrow("File must be under 4MB");
  });

  it("rejects unsupported extension", () => {
    expect(() =>
      StaffOCRFileSchema.parse({
        mimeType: "image/png",
        size: 1000,
        extension: "gif",
      })
    ).toThrow();
  });

  it("accepts PDF mime type", () => {
    const result = StaffOCRFileSchema.parse({
      mimeType: "application/pdf",
      size: 2_000_000,
      extension: "pdf",
    });
    expect(result.mimeType).toBe("application/pdf");
  });
});

describe("Staff OCRExtractedSchema", () => {
  it("defaults all fields to empty string", () => {
    const result = StaffOCRExtractedSchema.parse({});
    expect(result.fullName).toBe("");
    expect(result.fatherName).toBe("");
    expect(result.cnic).toBe("");
    expect(result.dob).toBe("");
    expect(result.designation).toBe("");
  });

  it("accepts provided values", () => {
    const result = StaffOCRExtractedSchema.parse({
      fullName: "John Doe",
      basicSalary: "50000",
    });
    expect(result.fullName).toBe("John Doe");
    expect(result.basicSalary).toBe("50000");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// STUDENT VALIDATORS
// ═════════════════════════════════════════════════════════════════════════════

describe("CreateStudentSchema", () => {
  it("accepts valid student data", () => {
    const result = CreateStudentSchema.parse({
      identity: { admissionNumber: "ADM001", rollNumber: 1045 },
      personal: { firstName: "Ali", gender: "Male" },
      academic: { campusId: "campus1", classId: "10", admissionDate: "2024-01-01" },
      parentReferences: {},
    });

    expect(result.personal.firstName).toBe("Ali");
    expect(result.academic.classId).toBe("10");
    expect(result.academic.sectionId).toBe("A");
  });

  it("applies defaults for optional fields", () => {
    const result = CreateStudentSchema.parse({
      identity: {},
      personal: { firstName: "Ali" },
      academic: { campusId: "campus1", classId: "10", admissionDate: "2024-01-01" },
      parentReferences: {},
    });

    expect(result.academic.sectionId).toBe("A");
    expect(result.personal.gender).toBe("Male");
  });

  it("rejects missing firstName", () => {
    expect(() =>
      CreateStudentSchema.parse({
        identity: {},
        personal: {},
        academic: { campusId: "campus1", classId: "10", admissionDate: "2024-01-01" },
        parentReferences: {},
      })
    ).toThrow("Required");
  });

  it("rejects missing classId", () => {
    expect(() =>
      CreateStudentSchema.parse({
        identity: {},
        personal: { firstName: "Ali" },
        academic: { campusId: "campus1", admissionDate: "2024-01-01" },
        parentReferences: {},
      })
    ).toThrow();
  });

  it("accepts rollNumber as string or number", () => {
    const result = CreateStudentSchema.parse({
      identity: { rollNumber: "1045" },
      personal: { firstName: "Ali" },
      academic: { campusId: "campus1", classId: "10", admissionDate: "2024-01-01" },
      parentReferences: {},
    });
    expect(result.identity.rollNumber).toBe("1045");
  });

  it("accepts valid email in contacts", () => {
    const result = CreateStudentSchema.parse({
      identity: {},
      personal: { firstName: "Ali" },
      academic: { campusId: "campus1", classId: "10", admissionDate: "2024-01-01" },
      parentReferences: {},
      contacts: { email: "ali@school.com" },
    });
    expect(result.contacts?.email).toBe("ali@school.com");
  });

  it("accepts empty email in contacts", () => {
    const result = CreateStudentSchema.parse({
      identity: {},
      personal: { firstName: "Ali" },
      academic: { campusId: "campus1", classId: "10", admissionDate: "2024-01-01" },
      parentReferences: {},
      contacts: { email: "" },
    });
    expect(result.contacts?.email).toBe("");
  });
});

describe("UpdateStudentSchema", () => {
  it("accepts partial update", () => {
    const result = UpdateStudentSchema.parse({
      personal: { firstName: "Updated Name" },
    });
    expect(result.personal?.firstName).toBe("Updated Name");
  });

  it("accepts empty object", () => {
    const result = UpdateStudentSchema.parse({});
    expect(result).toEqual({});
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// FEES VALIDATORS
// ═════════════════════════════════════════════════════════════════════════════

describe("CreateFeeSchema", () => {
  it("accepts valid fee record", () => {
    const result = CreateFeeSchema.parse({
      studentId: "student123",
      feeMonth: "2024-01",
      amountPaid: 5000,
    });
    expect(result.studentId).toBe("student123");
    expect(result.amountPaid).toBe(5000);
    expect(result.paymentMethod).toBe("Cash"); // default
  });

  it("rejects missing studentId", () => {
    expect(() =>
      CreateFeeSchema.parse({ feeMonth: "2024-01", amountPaid: 5000 })
    ).toThrow();
  });

  it("rejects negative amount", () => {
    expect(() =>
      CreateFeeSchema.parse({
        studentId: "s1",
        feeMonth: "2024-01",
        amountPaid: -100,
      })
    ).toThrow("Amount must be greater than 0");
  });

  it("rejects zero amount", () => {
    expect(() =>
      CreateFeeSchema.parse({
        studentId: "s1",
        feeMonth: "2024-01",
        amountPaid: 0,
      })
    ).toThrow("Amount must be greater than 0");
  });

  it("accepts all payment methods", () => {
    for (const method of ["Cash", "Bank Transfer", "Online / JazzCash"] as const) {
      const result = CreateFeeSchema.parse({
        studentId: "s1",
        feeMonth: "2024-01",
        amountPaid: 100,
        paymentMethod: method,
      });
      expect(result.paymentMethod).toBe(method);
    }
  });
});

describe("UpdateFeeSchema", () => {
  it("accepts partial update", () => {
    const result = UpdateFeeSchema.parse({ amountPaid: 6000 });
    expect(result.amountPaid).toBe(6000);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// ATTENDANCE VALIDATORS
// ═════════════════════════════════════════════════════════════════════════════

describe("MarkAttendanceSchema", () => {
  it("accepts valid attendance", () => {
    const result = MarkAttendanceSchema.parse({
      studentId: "s1",
      classGrade: "10",
      section: "A",
      date: "2024-01-15",
      status: "Present",
    });
    expect(result.status).toBe("Present");
  });

  it("rejects invalid date format", () => {
    expect(() =>
      MarkAttendanceSchema.parse({
        studentId: "s1",
        classGrade: "10",
        section: "A",
        date: "15-01-2024",
        status: "Present",
      })
    ).toThrow("Invalid date format");
  });

  it("rejects invalid status", () => {
    expect(() =>
      MarkAttendanceSchema.parse({
        studentId: "s1",
        classGrade: "10",
        section: "A",
        date: "2024-01-15",
        status: "Unknown",
      })
    ).toThrow("Status must be Present, Absent, Leave, Late, HalfDay, or Holiday");
  });

  it("accepts Absent and Leave status", () => {
    const r1 = MarkAttendanceSchema.parse({
      studentId: "s1", classGrade: "10", section: "A",
      date: "2024-01-15", status: "Absent",
    });
    expect(r1.status).toBe("Absent");

    const r2 = MarkAttendanceSchema.parse({
      studentId: "s1", classGrade: "10", section: "A",
      date: "2024-01-15", status: "Leave",
    });
    expect(r2.status).toBe("Leave");
  });
});

describe("BulkAttendanceSchema", () => {
  it("accepts array of records", () => {
    const result = BulkAttendanceSchema.parse([
      { studentId: "s1", classGrade: "10", section: "A", date: "2024-01-15", status: "Present" },
      { studentId: "s2", classGrade: "10", section: "A", date: "2024-01-15", status: "Absent" },
    ]);
    expect(result).toHaveLength(2);
  });

  it("rejects empty array", () => {
    expect(() => BulkAttendanceSchema.parse([])).toThrow("At least one attendance record required");
  });
});

describe("GetAttendanceQuerySchema", () => {
  it("accepts empty query", () => {
    const result = GetAttendanceQuerySchema.parse({});
    expect(result.date).toBeUndefined();
  });

  it("validates date format if provided", () => {
    expect(() =>
      GetAttendanceQuerySchema.parse({ date: "invalid" })
    ).toThrow("Invalid date format");
  });

  it("accepts valid query", () => {
    const result = GetAttendanceQuerySchema.parse({
      date: "2024-01-15",
      classGrade: "10",
      section: "A",
    });
    expect(result.date).toBe("2024-01-15");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// MARKS VALIDATORS
// ═════════════════════════════════════════════════════════════════════════════

describe("SaveMarkSchema", () => {
  it("accepts valid mark", () => {
    const result = SaveMarkSchema.parse({
      studentId: "s1",
      classGrade: "10",
      section: "A",
      term: "Midterm",
      subject: "Math",
      marksObtained: 85,
      totalMarks: 100,
      skills: { "Problem Solving": 90, "Critical Thinking": 80 },
    });
    expect(result.percentage).toBeUndefined(); // optional
  });

  it("rejects negative marksObtained", () => {
    expect(() =>
      SaveMarkSchema.parse({
        studentId: "s1", classGrade: "10", section: "A",
        term: "Midterm", subject: "Math",
        marksObtained: -1, totalMarks: 100,
      })
    ).toThrow();
  });

  it("rejects totalMarks < 1", () => {
    expect(() =>
      SaveMarkSchema.parse({
        studentId: "s1", classGrade: "10", section: "A",
        term: "Midterm", subject: "Math",
        marksObtained: 50, totalMarks: 0,
      })
    ).toThrow("Total marks must be >= 1");
  });

  it("accepts percentage as optional", () => {
    const result = SaveMarkSchema.parse({
      studentId: "s1", classGrade: "10", section: "A",
      term: "Midterm", subject: "Math",
      marksObtained: 85, totalMarks: 100,
      percentage: 85,
    });
    expect(result.percentage).toBe(85);
  });
});

describe("SkillsSchema", () => {
  it("accepts valid skills", () => {
    const result = SkillsSchema.parse({
      studentId: "s1",
      term: "Midterm",
      subject: "Math",
      skills: { "Problem Solving": 90 },
    });
    expect(result.skills?.["Problem Solving"]).toBe(90);
  });

  it("accepts missing skills", () => {
    const result = SkillsSchema.parse({
      studentId: "s1",
      term: "Midterm",
      subject: "Math",
    });
    expect(result.skills).toBeUndefined();
  });
});

describe("BulkPublishSchema", () => {
  it("accepts valid bulk publish", () => {
    const result = BulkPublishSchema.parse({
      classGrade: "10",
      section: "A",
      term: "Midterm",
    });
    expect(result.classGrade).toBe("10");
  });
});

describe("GetMarksQuerySchema", () => {
  it("accepts empty query", () => {
    const result = GetMarksQuerySchema.parse({});
    expect(result).toEqual({});
  });

  it("accepts partial query", () => {
    const result = GetMarksQuerySchema.parse({
      classGrade: "10",
      studentId: "s1",
    });
    expect(result.classGrade).toBe("10");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PARENT VALIDATORS
// ═════════════════════════════════════════════════════════════════════════════

describe("CreateParentSchema", () => {
  it("accepts valid parent", () => {
    const result = CreateParentSchema.parse({
      email: "parent@school.com",
      password: "password123",
      fullName: "Mr. Khan",
      studentIds: ["s1", "s2"],
    });
    expect(result.email).toBe("parent@school.com");
    expect(result.studentIds).toEqual(["s1", "s2"]);
  });

  it("rejects invalid email", () => {
    expect(() =>
      CreateParentSchema.parse({
        email: "invalid",
        password: "password123",
        fullName: "Mr. Khan",
        studentIds: ["s1"],
      })
    ).toThrow("Valid email is required");
  });

  it("rejects short password", () => {
    expect(() =>
      CreateParentSchema.parse({
        email: "parent@school.com",
        password: "123",
        fullName: "Mr. Khan",
        studentIds: ["s1"],
      })
    ).toThrow("Password must be at least 6 characters");
  });

  it("rejects empty fullName", () => {
    expect(() =>
      CreateParentSchema.parse({
        email: "parent@school.com",
        password: "password123",
        fullName: "",
        studentIds: ["s1"],
      })
    ).toThrow("Full name is required");
  });

  it("rejects empty studentIds", () => {
    expect(() =>
      CreateParentSchema.parse({
        email: "parent@school.com",
        password: "password123",
        fullName: "Mr. Khan",
        studentIds: [],
      })
    ).toThrow("At least one student ID is required");
  });

  it("applies phone default", () => {
    const result = CreateParentSchema.parse({
      email: "parent@school.com",
      password: "password123",
      fullName: "Mr. Khan",
      studentIds: ["s1"],
    });
    expect(result.phone).toBe("");
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TIMETABLE VALIDATORS
// ═════════════════════════════════════════════════════════════════════════════

describe("CreateTimetableEntrySchema", () => {
  it("accepts valid timetable entry", () => {
    const result = CreateTimetableEntrySchema.parse({
      day: "Monday",
      period: "1st",
      subject: "Math",
      classGrade: "10",
      teacher: "Mr. Khan",
    });
    expect(result.day).toBe("Monday");
    expect(result.teacher).toBe("Mr. Khan");
  });

  it("accepts optional meetingLink", () => {
    const result = CreateTimetableEntrySchema.parse({
      day: "Monday",
      period: "1st",
      subject: "Math",
      classGrade: "10",
      teacher: "Mr. Khan",
      meetingLink: "https://meet.google.com/abc-defg-hij",
    });
    expect(result.meetingLink).toBe("https://meet.google.com/abc-defg-hij");
  });

  it("accepts empty meetingLink", () => {
    const result = CreateTimetableEntrySchema.parse({
      day: "Monday",
      period: "1st",
      subject: "Math",
      classGrade: "10",
      teacher: "Mr. Khan",
      meetingLink: "",
    });
    expect(result.meetingLink).toBe("");
  });

  it("rejects invalid meetingLink URL", () => {
    expect(() =>
      CreateTimetableEntrySchema.parse({
        day: "Monday",
        period: "1st",
        subject: "Math",
        classGrade: "10",
        teacher: "Mr. Khan",
        meetingLink: "not-a-url",
      })
    ).toThrow("Invalid meeting link URL");
  });

  it("rejects missing required fields", () => {
    expect(() =>
      CreateTimetableEntrySchema.parse({
        day: "Monday",
      })
    ).toThrow();
  });
});
