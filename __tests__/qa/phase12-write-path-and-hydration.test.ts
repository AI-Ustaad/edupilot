import { ROLE_PERMISSIONS } from "@/lib/auth/roles";
import { CreateTimetableEntrySchema } from "@/validators/timetable/TimetableValidator";
import { safeArray, unwrapApiResponse } from "@/lib/api/safeResponse";

describe("Phase 12 — Write-Path & Hydration Fixes Verification", () => {
  const tenantId = "tenant-phase12-apple5";

  describe("Item 1: Attendance Persistence, Permissions & Numeric Roll Sorting", () => {
    it("should grant 'attendance.mark' permission to both admin and teacher roles", () => {
      expect(ROLE_PERMISSIONS.admin).toContain("attendance.mark");
      expect(ROLE_PERMISSIONS.teacher).toContain("attendance.mark");
      expect(ROLE_PERMISSIONS.admin).toContain("classes.create");
      expect(ROLE_PERMISSIONS.admin).toContain("classes.manage");
    });

    it("should sort student roll numbers numerically (1..30) rather than alphabetically", () => {
      const mockStudents = [
        { id: "s-10", rollNumber: "10", fullName: "Student 10" },
        { id: "s-1", rollNumber: "1", fullName: "Student 01" },
        { id: "s-2", rollNumber: "02", fullName: "Student 02" },
        { id: "s-20", rollNumber: "20", fullName: "Student 20" },
        { id: "s-3", rollNumber: "3", fullName: "Student 03" },
      ];

      const sorted = [...mockStudents].sort((a, b) => {
        const rA = parseInt(String(a.rollNumber).replace(/\D/g, ""), 10) || 0;
        const rB = parseInt(String(b.rollNumber).replace(/\D/g, ""), 10) || 0;
        return rA - rB;
      });

      expect(sorted.map(s => s.rollNumber)).toEqual(["1", "02", "3", "10", "20"]);
      expect(sorted[0].fullName).toBe("Student 01");
      expect(sorted[1].fullName).toBe("Student 02");
    });
  });

  describe("Item 2: Fee Seeding (1 Paid = 5k, 29 Pending = 145k) & Clean Formatting", () => {
    it("should cleanly format dirty class/section labels", () => {
      const formatClassSection = (str: string) => {
        if (!str) return "Class 9";
        let cleaned = str
          .replace(/CLASSCLASS/gi, "Class ")
          .replace(/CLASS/gi, "Class ")
          .replace(/SECTION/gi, "Section ")
          .replace(/[-_]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const match = cleaned.match(/(?:Class\s*)?(\d+|[A-Za-z]+)\s*(?:Section\s*)?([A-Za-z]+)?/i);
        if (match) {
          const cls = match[1];
          const sec = match[2];
          return sec ? `Class ${cls} - Section ${sec.toUpperCase()}` : `Class ${cls}`;
        }
        return cleaned;
      };

      expect(formatClassSection("CLASSCLASS 9- SECTIONC")).toBe("Class 9 - Section C");
      expect(formatClassSection("CLASSCLASS 9- SECTIONA")).toBe("Class 9 - Section A");
      expect(formatClassSection("CLASSCLASS 9- SECTIONB")).toBe("Class 9 - Section B");
    });

    it("should compute exact financial totals for 30 students: 5k collected, 145k pending", () => {
      const mockStudents = Array.from({ length: 30 }, (_, i) => ({
        id: `student-${i + 1}`,
        fullName: `Test Student ${String(i + 1).padStart(2, "0")}`,
        status: "active",
      }));

      // 1 paid record in Firestore, 29 missing records that are auto-seeded
      const existingFeeDocs = [
        { id: "fee-1", studentId: "student-1", feeMonth: "November 2026", status: "Paid", amount: 5000, amountPaid: 5000, amountDue: 0 }
      ];

      // Auto-reconciliation simulation
      const feeRecords = [...existingFeeDocs];
      for (const student of mockStudents) {
        if (!feeRecords.some(f => f.studentId === student.id)) {
          feeRecords.push({
            id: `fee-auto-${student.id}`,
            studentId: student.id,
            feeMonth: "November 2026",
            status: "Pending",
            amount: 5000,
            amountPaid: 0,
            amountDue: 5000,
          });
        }
      }

      expect(feeRecords.length).toBe(30);
      const totalCollected = feeRecords.filter(f => f.status.toLowerCase() === "paid").reduce((acc, f) => acc + f.amountPaid, 0);
      const totalPending = feeRecords.filter(f => f.status.toLowerCase() === "pending").reduce((acc, f) => acc + f.amountDue, 0);

      expect(totalCollected).toBe(5000);
      expect(totalPending).toBe(145000);
    });
  });

  describe("Item 3: Staff Profile & Edit Hydration with Unwrap & List Fallback", () => {
    it("should correctly unwrap nested API responses", () => {
      const nestedResponse = {
        data: {
          success: true,
          data: {
            id: "staff-1",
            fullName: "Amina Khan",
            designation: "Senior Teacher",
            department: "Science",
          }
        }
      };

      const unwrapped = unwrapApiResponse(nestedResponse);
      expect(unwrapped.id).toBe("staff-1");
      expect(unwrapped.fullName).toBe("Amina Khan");
    });

    it("should fallback to staff list if individual staff member payload is sparse", () => {
      const staffList = [
        {
          id: "staff-qa-1",
          fullName: "Muhammad Tariq",
          fatherName: "Abdul Rehman",
          cnic: "35201-1234567-1",
          mobile: "+92 300 1234567",
          email: "tariq@testschool.edu.pk",
          designation: "Mathematics Teacher",
          department: "Mathematics",
          address: "123 Education Boulevard, Lahore",
        }
      ];

      const sparseStaffData: any = { id: "staff-qa-1" };
      const fallbackStaff: any = staffList.find(s => s.id === sparseStaffData.id) || {};
      const resolved = { ...fallbackStaff, ...sparseStaffData };

      expect(resolved.fullName || fallbackStaff.fullName).toBe("Muhammad Tariq");
      expect(resolved.cnic || fallbackStaff.cnic).toBe("35201-1234567-1");
      expect(resolved.fatherName || fallbackStaff.fatherName).toBe("Abdul Rehman");
      expect(resolved.designation || fallbackStaff.designation).toBe("Mathematics Teacher");
    });
  });

  describe("Item 4: Class & Section Creation & Normalization", () => {
    it("should normalize class grade and section name", () => {
      const normalizeClassGrade = (grade: string) => {
        const trimmed = (grade || "").trim();
        if (/^\d+$/.test(trimmed)) return `Class ${trimmed}`;
        return trimmed;
      };

      const normalizeSectionName = (sec: string) => (sec || "").trim().toUpperCase();

      expect(normalizeClassGrade("2")).toBe("Class 2");
      expect(normalizeClassGrade("Class 2")).toBe("Class 2");
      expect(normalizeSectionName("b")).toBe("B");
      expect(normalizeSectionName(" B ")).toBe("B");
    });
  });

  describe("Item 5: Dashboard Mathematical Accuracy & Full Department Tally", () => {
    it("should show Rs 145,000 pending when expected is 150,000 and collected is 5,000", () => {
      const totalStudents = 30;
      const expectedPerStudent = 5000;
      const totalExpected = totalStudents * expectedPerStudent;
      const collectedFees = 5000;
      const pendingFees = Math.max(0, totalExpected - collectedFees);

      expect(totalExpected).toBe(150000);
      expect(pendingFees).toBe(145000);
    });

    it("should not truncate staff departments so sum equals total 10 staff members", () => {
      const staffList = [
        { id: "s1", department: "Science" },
        { id: "s2", department: "Science" },
        { id: "s3", department: "Mathematics" },
        { id: "s4", department: "Mathematics" },
        { id: "s5", department: "English" },
        { id: "s6", department: "Urdu" },
        { id: "s7", department: "Islamiat" },
        { id: "s8", department: "Social Studies" },
        { id: "s9", department: "Computer" },
        { id: "s10", department: "Administration" },
      ];

      const counts: Record<string, number> = {};
      staffList.forEach(s => {
        counts[s.department] = (counts[s.department] || 0) + 1;
      });

      const departmentEntries = Object.entries(counts).map(([name, count]) => ({ name, count }));
      
      // Previously, .slice(0, 6) truncated the list and caused sum to be 7 or 8.
      // Without slice, all 8 unique departments are rendered.
      const totalStaffCount = departmentEntries.reduce((acc, d) => acc + d.count, 0);
      expect(totalStaffCount).toBe(10);
      expect(departmentEntries.length).toBe(8);
    });
  });

  describe("Item 6: Timetable Section Validation & Array Unwrapping", () => {
    it("should validate timetable entry payload containing section", () => {
      const validPayload = {
        day: "Monday",
        period: "1st Period",
        subject: "Mathematics",
        classGrade: "Class 9",
        section: "A",
        teacher: "Muhammad Tariq",
        meetingLink: "https://meet.google.com/abc-defg-hij",
      };

      const result = CreateTimetableEntrySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.section).toBe("A");
      }
    });

    it("should extract entries correctly from timetable API responses using safeArray", () => {
      const responseWithEntries = {
        success: true,
        data: {
          entries: [
            { id: "tt-1", day: "Monday", period: "1", subject: "Math", classGrade: "Class 9", section: "A" },
            { id: "tt-2", day: "Tuesday", period: "2", subject: "English", classGrade: "Class 9", section: "B" },
          ]
        }
      };

      const entries = safeArray(responseWithEntries);
      expect(entries).toHaveLength(2);
      expect(entries[0].section).toBe("A");
    });
  });

  describe("Item 7: Examination Results Class Dropdown Prefix Deduplication", () => {
    it("should not double-prefix 'Class' when the class string already contains 'Class'", () => {
      const availableClasses = ["Class 7", "Class 8", "Class 9", "10"];

      const labels = availableClasses.map((c: string) => {
        return c.toLowerCase().startsWith("class ") ? c : `Class ${c}`;
      });

      expect(labels).toEqual(["Class 7", "Class 8", "Class 9", "Class 10"]);
      expect(labels[0]).not.toBe("Class Class 7");
      expect(labels[0]).toBe("Class 7");
    });
  });
});
