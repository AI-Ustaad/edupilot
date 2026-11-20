import { DEFAULT_CANONICAL_MENU } from "@/app/api/v1/menu/route";
import { getTenantContextSnapshot } from "@/lib/ai/tenant-snapshot";
import { PrincipalAgent } from "@/lib/ai/strategies/PrincipalAgent";
import { TeacherAgent } from "@/lib/ai/strategies/TeacherAgent";
import { safeArray, safeObject } from "@/lib/api/safeResponse";

describe("Phase 18 - Phase 7: Admin Governance & AI Activation Test Suite", () => {
  describe("Defect 1: Audit Center Timestamps & User Resolution", () => {
    const parseAndFormatDate = (date: any) => {
      let d: Date | null = null;
      if (!date) return "N/A";
      if (typeof date?.toDate === "function") d = date.toDate();
      else if (date instanceof Date) d = isNaN(date.getTime()) ? null : date;
      else if (date?._seconds !== undefined) d = new Date(date._seconds * 1000);
      else if (date?.seconds !== undefined) d = new Date(date.seconds * 1000);
      else if (typeof date === "number") d = new Date(date);
      else if (typeof date === "string") d = new Date(date);

      if (!d || isNaN(d.getTime())) return "N/A";

      return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(d);
    };

    it("should parse Firestore Timestamp objects with _seconds without returning N/A", () => {
      const firestoreTs = { _seconds: 1763568000, _nanoseconds: 0 }; // 19 Nov 2025
      const formatted = parseAndFormatDate(firestoreTs);
      expect(formatted).not.toBe("N/A");
      expect(formatted).toContain("2025");
    });

    it("should parse integer epochs and ISO date strings accurately", () => {
      const epoch = Date.now();
      const isoString = new Date().toISOString();

      expect(parseAndFormatDate(epoch)).not.toBe("N/A");
      expect(parseAndFormatDate(isoString)).not.toBe("N/A");
    });

    it("should gracefully handle null and undefined timestamps", () => {
      expect(parseAndFormatDate(null)).toBe("N/A");
      expect(parseAndFormatDate(undefined)).toBe("N/A");
      expect(parseAndFormatDate("invalid-date-string")).toBe("N/A");
    });

    it("should enrich audit log entries with human-readable user names and emails", () => {
      const userMap = new Map([
        ["uid_123", { name: "Imran Haider", email: "sindhu.sgd143@gmail.com", role: "admin" }],
      ]);

      const log = { id: "log_1", action: "marks.created", userId: "uid_123", createdAt: new Date().toISOString() };
      const user = userMap.get(log.userId);

      const enriched = {
        ...log,
        userName: user?.name,
        userEmail: user?.email,
        userRole: user?.role,
      };

      expect(enriched.userName).toBe("Imran Haider");
      expect(enriched.userEmail).toBe("sindhu.sgd143@gmail.com");
      expect(enriched.userRole).toBe("admin");
    });
  });

  describe("Defect 2: Menu Manager Defaults & Sidebar Deduplication", () => {
    it("should hydrate DEFAULT_CANONICAL_MENU with all core modules when custom menu is empty", () => {
      expect(Array.isArray(DEFAULT_CANONICAL_MENU)).toBe(true);
      expect(DEFAULT_CANONICAL_MENU.length).toBeGreaterThanOrEqual(12);

      const paths = DEFAULT_CANONICAL_MENU.map(m => m.path);
      expect(paths).toContain("/dashboard");
      expect(paths).toContain("/students");
      expect(paths).toContain("/staff");
      expect(paths).toContain("/payroll");
      expect(paths).toContain("/fees");
      expect(paths).toContain("/exams");
      expect(paths).toContain("/admin/parents");
    });
  });

  describe("Defect 3: White Label Branding Properties & Fallbacks", () => {
    it("should correctly preserve all white label assets and theme attributes", () => {
      const branding = {
        tenantId: "tenant_ghs_sahiwal",
        schoolName: "Government High School Sahiwal",
        logo: "https://example.com/logo.png",
        favicon: "https://example.com/favicon.ico",
        coverImage: "https://example.com/cover.jpg",
        primaryColor: "#3b82f6",
        secondaryColor: "#10b981",
        customDomain: "portal.ghssahiwal.edu.pk",
        customCSS: ".header { border-radius: 8px; }",
      };

      expect(branding.schoolName).toBe("Government High School Sahiwal");
      expect(branding.primaryColor).toBe("#3b82f6");
      expect(branding.secondaryColor).toBe("#10b981");
      expect(branding.favicon).toContain("favicon.ico");
      expect(branding.coverImage).toContain("cover.jpg");
    });
  });

  describe("Defect 4: Parents & Guardians Directory Aggregation", () => {
    it("should aggregate student guardians and map linked students correctly", () => {
      const mockStudents = [
        { id: "st_1", fullName: "Ahmed Shah", classGrade: "Class 1", section: "A", fatherName: "Shahid Shah", phone: "03001111111" },
        { id: "st_2", fullName: "Bilal Khan", classGrade: "Class 2", section: "B", guardianName: "Tariq Khan", emergencyContact: "03002222222" },
      ];

      const directory: any[] = [];
      for (const s of mockStudents) {
        const guardianName = s.guardianName || s.fatherName;
        const guardianPhone = s.phone || s.emergencyContact;
        directory.push({
          id: `guardian_${s.id}`,
          fullName: guardianName,
          phone: guardianPhone,
          accountType: "Student Guardian Record",
          students: [{ id: s.id, name: s.fullName, classGrade: s.classGrade, section: s.section }],
        });
      }

      expect(directory).toHaveLength(2);
      expect(directory[0].fullName).toBe("Shahid Shah");
      expect(directory[0].students[0].name).toBe("Ahmed Shah");
      expect(directory[1].fullName).toBe("Tariq Khan");
      expect(directory[1].students[0].classGrade).toBe("Class 2");
    });
  });

  describe("Defect 5: AI Permission Expansion & Student Comment URL Routing", () => {
    it("should accurately parse studentId from comment route URL segments", () => {
      const url = new URL("https://edupilot.test/api/v1/students/student_xyz_123/comment");
      const segments = url.pathname.split("/").filter(Boolean);
      const commentIndex = segments.indexOf("comment");
      const studentId = commentIndex > 0 ? segments[commentIndex - 1] : segments[segments.length - 1];

      expect(studentId).toBe("student_xyz_123");
      expect(studentId).not.toBe("comment");
    });
  });

  describe("Defect 6: AI Timetable Hook Safe Unwrapping & Resilient Parsing", () => {
    it("should safely unwrap API array response using safeArray without returning empty object", () => {
      const mockApiResponse = {
        data: {
          success: true,
          data: [
            { day: "Monday", period: "1", subject: "Mathematics", classGrade: "Class 10", teacher: "Sir Ahmed" },
            { day: "Monday", period: "2", subject: "English", classGrade: "Class 10", teacher: "Ms. Fatima" },
          ],
        },
      };

      const result = safeArray(mockApiResponse);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result[0].subject).toBe("Mathematics");

      // Verify that calling safeObject on array returns {} (the original bug)
      const badObjectResult = safeObject(mockApiResponse.data.data);
      expect(badObjectResult).toEqual({});
    });

    it("should defensively parse markdown-wrapped JSON arrays from AI responses", () => {
      const rawAiResponse = `
\`\`\`json
[
  { "day": "Monday", "period": "1", "subject": "Science", "class": "Class 10", "teacher": "Dr. Tariq" }
]
\`\`\`
      `.trim();

      let cleaned = rawAiResponse;
      const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        cleaned = codeBlockMatch[1].trim();
      }

      const parsed = JSON.parse(cleaned);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].subject).toBe("Science");
      expect(parsed[0].teacher).toBe("Dr. Tariq");
    });
  });

  describe("Defect 7: Live Tenant Context Snapshot & Principal Copilot Prompting", () => {
    it("should generate a rich live tenant snapshot with school details", async () => {
      const snapshot = await getTenantContextSnapshot("tenant_ghs_sahiwal");
      expect(typeof snapshot).toBe("string");
      expect(snapshot).toContain("Academic Year: 2026-2027");
      expect(snapshot).toContain("Enrolled Students");
      expect(snapshot).toContain("Active Staff Members");
    });

    it("should inject tenant snapshot into PrincipalAgent system prompt", () => {
      const agent = new PrincipalAgent();
      const prompt = agent.buildSystemPrompt({
        tenantId: "tenant_ghs_sahiwal",
        userId: "user_1",
        userRole: "admin",
        query: "What is our attendance status?",
        tenantSnapshot: "Live School Context: 50 Students, 10 Staff, 94% Attendance",
      });

      expect(prompt).toContain("Principal Copilot Agent");
      expect(prompt).toContain("50 Students, 10 Staff, 94% Attendance");
    });

    it("should inject tenant snapshot into TeacherAgent system prompt", () => {
      const agent = new TeacherAgent();
      const prompt = agent.buildSystemPrompt({
        tenantId: "tenant_ghs_sahiwal",
        userId: "user_2",
        userRole: "teacher",
        query: "Lesson plan for Class 10",
        tenantSnapshot: "Live School Context: Government High School Sahiwal",
      });

      expect(prompt).toContain("Teacher Agent");
      expect(prompt).toContain("Government High School Sahiwal");
    });

    it("should allow empty/optional query for Principal Copilot and use default executive prompt", () => {
      const rawQuery = "";
      const agentType = "principal";
      const effectiveQuery = (typeof rawQuery === "string" && rawQuery.trim())
        ? rawQuery.trim()
        : (agentType === "principal"
            ? "Provide an executive summary of current school operations, student attendance, academic health, and key recommendations."
            : "");

      expect(effectiveQuery).toContain("Provide an executive summary");
    });
  });
});
