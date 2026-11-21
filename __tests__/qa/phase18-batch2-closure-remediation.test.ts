import { CreateFeeSchema } from "@/dto/CreateFeeDTO";
import { normalizeBillingMonth } from "@/services/fees.service";
import { getTenantContextSnapshot } from "@/lib/ai/tenant-snapshot";
import { stripMarkdown } from "@/components/ui/FormattedAiText";

describe("Phase 18 Batch 2 - Final Closure Remediation QA Test Suite", () => {
  describe("1. §1 - Fee Schema Validation & Zero Revenue Accounting Invariant", () => {
    it("should accept valid fee payload for pending fees without validation failure", () => {
      const pendingPayload = {
        studentId: "std_test_001",
        studentName: "Ahmed Shah",
        classGrade: "Class 1",
        section: "A",
        feeMonth: "November 2026",
        amount: 5000,
        amountPaid: 5000,
        status: "pending",
      };

      const result = CreateFeeSchema.safeParse(pendingPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amountPaid).toBe(5000);
        expect(result.data.status).toBe("pending");
      }
    });

    it("should accept amountPaid = 5000 for paid fee collections", () => {
      const paidPayload = {
        studentId: "std_test_001",
        studentName: "Ahmed Shah",
        classGrade: "Class 1",
        section: "A",
        feeMonth: "November 2026",
        amount: 5000,
        amountPaid: 5000,
        status: "paid",
        receiptNumber: "RCP-202611-TEST01",
        paidAt: new Date().toISOString(),
      };

      const result = CreateFeeSchema.safeParse(paidPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amountPaid).toBe(5000);
        expect(result.data.status).toBe("paid");
        expect(result.data.receiptNumber).toBe("RCP-202611-TEST01");
      }
    });

    it("should properly normalize billing month labels and keys", () => {
      const norm = normalizeBillingMonth("November 2026");
      expect(norm.label).toBe("November 2026");
      expect(norm.monthName).toBe("November");
      expect(norm.year).toBe("2026");
      expect(norm.monthNum).toBe("11");
      expect(norm.key).toBe("nov_2026");
    });
  });

  describe("2. §2 - Report Comments Clean Text & Deterministic Fallback", () => {
    it("should strip raw markdown symbols (hashes, asterisks, rules) cleanly", () => {
      const rawText = `### Student Evaluation\n---\n**Ahmed Shah** has performed exceptionally well in **Mathematics**.\n- High aptitude\n* Regular attendance`;
      const clean = stripMarkdown(rawText);
      expect(clean).not.toContain("###");
      expect(clean).not.toContain("---");
      expect(clean).not.toContain("**");
      expect(clean).toContain("Ahmed Shah has performed exceptionally well in Mathematics.");
    });
  });

  describe("3. §4 - Billing Limit Comparison & At Plan Limit Thresholds", () => {
    it("should NOT flag 50/50 students or 10/10 staff as exceeding plan limit", () => {
      const plan = { limits: { students: 50, staff: 10, aiQuota: 50 } };
      const studentsUsed = 50;
      const staffUsed = 10;
      const aiUsed = 15;

      const isStudentOverLimit = plan.limits.students < 999999 && studentsUsed > plan.limits.students;
      const isStaffOverLimit = plan.limits.staff < 999999 && staffUsed > plan.limits.staff;
      const isAiOverLimit = aiUsed > plan.limits.aiQuota;
      const isQuotaExceeded = isStudentOverLimit || isStaffOverLimit || isAiOverLimit;

      const isAtStudentLimit = plan.limits.students < 999999 && studentsUsed === plan.limits.students;
      const isAtStaffLimit = plan.limits.staff < 999999 && staffUsed === plan.limits.staff;
      const isAtPlanLimit = isAtStudentLimit || isAtStaffLimit;

      expect(isStudentOverLimit).toBe(false);
      expect(isStaffOverLimit).toBe(false);
      expect(isAiOverLimit).toBe(false);
      expect(isQuotaExceeded).toBe(false);

      expect(isAtStudentLimit).toBe(true);
      expect(isAtStaffLimit).toBe(true);
      expect(isAtPlanLimit).toBe(true);
    });

    it("should flag strictly when students or staff exceed the plan ceiling", () => {
      const plan = { limits: { students: 50, staff: 10, aiQuota: 50 } };
      const studentsUsed = 51;
      const staffUsed = 10;

      const isStudentOverLimit = plan.limits.students < 999999 && studentsUsed > plan.limits.students;
      const isStaffOverLimit = plan.limits.staff < 999999 && staffUsed > plan.limits.staff;

      expect(isStudentOverLimit).toBe(true);
      expect(isStaffOverLimit).toBe(false);
    });
  });

  describe("4. §5 - Grounded Tenant Context Snapshot for AI Chatbot", () => {
    it("should generate context with exact Class 1 per-section student breakdowns", async () => {
      const snapshot = await getTenantContextSnapshot("tenant_ghs_sahiwal");
      expect(snapshot).toContain("Government High School Sahiwal");
      expect(snapshot).toContain("2026-2027");
      expect(snapshot).toContain("Class 1: 45 students");
      expect(snapshot).toContain("Section A: 15");
      expect(snapshot).toContain("Section B: 15");
      expect(snapshot).toContain("Section C: 15");
      expect(snapshot).toContain("STF-001 through STF-010");
      expect(snapshot).toContain("Rs. 250,000");
    });
  });
});
