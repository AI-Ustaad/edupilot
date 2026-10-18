import { safeArray, safeObject, unwrapApiResponse } from "@/lib/api/safeResponse";
import { FeesService } from "@/services/fees.service";
import { StudentService } from "@/services/StudentService";
import { ConfigurationService } from "@/services/configuration.service";
import { FeePersistenceMapper } from "@/lib/mappers/FeePersistenceMapper";
import { BookService } from "@/services/book.service";

describe("Remediation Regression Tests: Symptoms A through J", () => {
  describe("Symptom E, C, F, H, J: Safe Envelope Unwrapping (safeArray & safeObject)", () => {
    it("should unwrap Axios envelope containing standard API success payload", () => {
      const axiosPayload = {
        data: {
          success: true,
          data: [
            { id: "cls_1", classGrade: "Class 1", section: "A" },
            { id: "cls_2", classGrade: "Class 2", section: "B" },
          ],
        },
        status: 200,
        statusText: "OK",
      };

      const result = safeArray(axiosPayload);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("cls_1");
      expect(result[1].classGrade).toBe("Class 2");
    });

    it("should unwrap Axios envelope containing paginated payload with items", () => {
      const axiosPaginated = {
        data: {
          items: [{ id: "item_1" }, { id: "item_2" }],
          total: 2,
        },
      };

      const result = safeArray(axiosPaginated);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("item_1");
    });

    it("should unwrap staff analytics without undefined active or onLeave (Symptom J)", () => {
      const axiosStaffAnalytics = {
        data: {
          success: true,
          data: {
            active: 14,
            onLeave: 2,
            total: 16,
          },
        },
      };

      const unwrapped = safeObject(axiosStaffAnalytics) as any;
      expect(unwrapped.active).toBe(14);
      expect(unwrapped.onLeave).toBe(2);
      expect(unwrapped.total).toBe(16);
      expect(`${unwrapped.active} active, ${unwrapped.onLeave} on leave`).toBe("14 active, 2 on leave");
    });

    it("should handle error shapes safely without crashing", () => {
      expect(safeArray(null)).toEqual([]);
      expect(safeArray(undefined)).toEqual([]);
      expect(safeArray({ error: "Unauthorized" })).toEqual([]);
      expect(safeObject(null)).toEqual({});
      expect(safeObject(undefined)).toEqual({});
    });
  });

  describe("Symptom G: Fee Management & Persistence Mapping", () => {
    it("should map fee document to flat compatibility fields correctly", () => {
      const feeDoc = {
        id: "fee_123",
        tenantId: "tenant_abc",
        studentId: "student_456",
        studentName: "Ali Khan",
        classGrade: "10",
        section: "A",
        feeMonth: "October",
        amountPaid: 5000,
        amountDue: 0,
        status: "paid",
        paymentDetails: {
          billingMonth: "October",
          amount: 5000,
          paidAmount: 5000,
          remainingAmount: 0,
          status: "Paid",
        },
      };

      const entity = FeePersistenceMapper.fromFirestore(feeDoc as any);
      expect(entity.id).toBe("fee_123");
      expect(entity.studentId).toBe("student_456");
      expect(entity.studentName).toBe("Ali Khan");
      expect(entity.amountPaid).toBe(5000);
      expect(entity.amount).toBe(5000);
      expect(entity.amountDue).toBe(0);
      expect(entity.status).toBe("paid");
    });

    it("should preserve numeric zero for amountDue without falsy fallback", () => {
      const feeDoc = {
        id: "fee_zero_due",
        studentId: "s_zero",
        amount: 8000,
        amountPaid: 8000,
        amountDue: 0,
        status: "paid",
      };

      const entity = FeePersistenceMapper.fromFirestore(feeDoc as any);
      expect(entity.amountDue).toBe(0);
      expect(entity.amountPaid).toBe(8000);
      expect(entity.amount).toBe(8000);
    });

    it("should handle partial payments with collected cash and outstanding balance", () => {
      const feeDoc = {
        id: "fee_partial",
        studentId: "s_part",
        amount: 10000,
        amountPaid: 4000,
        amountDue: 6000,
        status: "partial",
      };

      const entity = FeePersistenceMapper.fromFirestore(feeDoc as any);
      expect(entity.amountPaid).toBe(4000);
      expect(entity.amountDue).toBe(6000);
      expect(entity.amount).toBe(10000);
      expect(entity.status).toBe("partial");
    });

    it("should derive missing amountDue from assessed minus collected without negative debt", () => {
      const missingDueDoc = {
        id: "fee_derive",
        studentId: "s_derive",
        amount: 7500,
        amountPaid: 2500,
      };

      const entity = FeePersistenceMapper.fromFirestore(missingDueDoc as any);
      expect(entity.amountDue).toBe(5000);
      expect(entity.amountPaid).toBe(2500);
      expect(entity.amount).toBe(7500);
      expect(entity.status).toBe("partial");

      // Overpayment case: amountPaid > amount
      const overpaidDoc = {
        id: "fee_overpaid",
        studentId: "s_over",
        amount: 5000,
        amountPaid: 6000,
        status: "paid",
      };
      const overpaidEntity = FeePersistenceMapper.fromFirestore(overpaidDoc as any);
      expect(overpaidEntity.amountDue).toBe(0); // Never negative balance
    });

    it("should support legacy nested paymentDetails structures seamlessly", () => {
      const legacyDoc = {
        id: "fee_legacy_1",
        studentId: "s_legacy",
        paymentDetails: {
          billingMonth: "November",
          amount: 6000,
          paidAmount: 2000,
          remainingAmount: 4000,
          status: "Partial",
          paymentMethod: "Bank Transfer",
        },
      };

      const entity = FeePersistenceMapper.fromFirestore(legacyDoc as any);
      expect(entity.amountPaid).toBe(2000);
      expect(entity.amount).toBe(6000);
      expect(entity.amountDue).toBe(4000);
      expect(entity.feeMonth).toBe("November");
      expect(entity.paymentMethod).toBe("Bank Transfer");
      expect(entity.status).toBe("partial");
    });

    it("should accurately aggregate UI totalCollected and totalPending across mixed records without mistaking assessed fees for collections", () => {
      const records = [
        { id: "f1", status: "paid", amountPaid: 5000, amountDue: 0, amount: 5000 },
        { id: "f2", status: "partial", amountPaid: 4000, amountDue: 6000, amount: 10000 },
        { id: "f3", status: "pending", amountPaid: 0, amountDue: 8000, amount: 8000 },
        { id: "f4", status: "partial", amountPaid: 2000, amountDue: 3000, amount: 5000 },
        // Record with "paid" status but MISSING amountPaid: must NEVER count assessed fee as cash
        { id: "f5_missing_paid", status: "paid", amount: 12000 },
        // Record with "pending" status and zero amountPaid: must preserve numeric 0
        { id: "f6_zero_paid", status: "pending", amountPaid: 0, amountDue: 4500, amount: 4500 },
        // Contradictory: status "paid", amount: 7000, amountDue: 0, missing amountPaid
        { id: "f7_contra", status: "paid", amount: 7000, amountDue: 0 },
        // Negative, NaN, infinite values: must not corrupt totals
        { id: "f8_malformed", status: "partial", amountPaid: NaN, amountDue: -500, amount: Infinity },
      ];

      // Matching aggregation formula in fees/page.tsx
      const totalCollected = records.reduce((sum: number, f: any) => {
        const paid = typeof f.amountPaid === "number" && Number.isFinite(f.amountPaid) ? Math.max(0, f.amountPaid) : 0;
        if (paid > 0) {
          return sum + paid;
        }
        return sum;
      }, 0);

      const totalPending = records.reduce((sum: number, f: any) => {
        const status = f.status?.toLowerCase()?.trim();
        const explicitDue = typeof f.amountDue === "number" && Number.isFinite(f.amountDue) ? Math.max(0, f.amountDue) : null;
        if (explicitDue !== null) {
          return sum + explicitDue;
        }
        if (status === "pending" || status === "partial") {
          const assessed = typeof f.amount === "number" && Number.isFinite(f.amount) ? Math.max(0, f.amount) : 0;
          const paid = typeof f.amountPaid === "number" && Number.isFinite(f.amountPaid) ? Math.max(0, f.amountPaid) : 0;
          return sum + Math.max(0, assessed - paid);
        }
        return sum;
      }, 0);

      // totalCollected: 5000 (f1) + 4000 (f2) + 2000 (f4) = 11,000 (f5, f6, f7, f8 contribute 0)
      expect(totalCollected).toBe(11000);
      // totalPending: 6000 (f2) + 8000 (f3) + 3000 (f4) + 4500 (f6) = 21,500
      expect(totalPending).toBe(21500);
    });

    it("should never infer cash collected from assessed fee amount when amountPaid is absent", () => {
      const docMissingPaid = {
        id: "fee_no_paid",
        studentId: "s_no_paid",
        amount: 7000,
        status: "paid", // Status says paid, but no money is recorded!
      };
      const entity = FeePersistenceMapper.fromFirestore(docMissingPaid as any);
      expect(entity.amountPaid).toBe(0); // Must be 0, NOT 7000!
      expect(entity.amount).toBe(7000);
      expect(entity.amountDue).toBe(7000); // 7000 assessed - 0 collected = 7000 outstanding
    });

    it("should handle contradictory record with status: 'paid', amount: 7000, amountDue: 0, and missing amountPaid without inferring cash collection", () => {
      const contradictoryDoc = {
        id: "fee_contra_1",
        studentId: "s_contra",
        status: "paid",
        amount: 7000,
        amountDue: 0, // Admin cleared due balance or marked paid without recording collection
      };
      const entity = FeePersistenceMapper.fromFirestore(contradictoryDoc as any);
      // Authoritative: cash collected cannot be inferred from status or amount
      expect(entity.amountPaid).toBe(0);
      expect(entity.amount).toBe(7000);
      expect(entity.amountDue).toBe(0); // Preserves explicit numeric zero
      expect(entity.status).toBe("paid");
    });

    it("should handle missing amountPaid with explicit positive amountDue", () => {
      const explicitDueDoc = {
        id: "fee_explicit_due",
        studentId: "s_exp_due",
        amount: 8500,
        amountDue: 8500,
        status: "pending",
      };
      const entity = FeePersistenceMapper.fromFirestore(explicitDueDoc as any);
      expect(entity.amountPaid).toBe(0);
      expect(entity.amount).toBe(8500);
      expect(entity.amountDue).toBe(8500);
      expect(entity.status).toBe("pending");

      // Without explicit amount, derives assessed from amountDue + collected (0)
      const noAmountDoc = {
        id: "fee_no_amt",
        studentId: "s_no_amt",
        amountDue: 4500,
        status: "pending",
      };
      const noAmtEntity = FeePersistenceMapper.fromFirestore(noAmountDoc as any);
      expect(noAmtEntity.amountPaid).toBe(0);
      expect(noAmtEntity.amount).toBe(4500);
      expect(noAmtEntity.amountDue).toBe(4500);
    });

    it("should handle missing assessed amount with a verified payment", () => {
      const paymentOnlyDoc = {
        id: "fee_payment_only",
        studentId: "s_pay_only",
        amountPaid: 3500,
        status: "paid",
      };
      const entity = FeePersistenceMapper.fromFirestore(paymentOnlyDoc as any);
      expect(entity.amountPaid).toBe(3500);
      // Assessed defaults to collected when absent and no due balance is specified
      expect(entity.amount).toBe(3500);
      expect(entity.amountDue).toBe(0);
      expect(entity.status).toBe("paid");
    });

    it("should sanitize negative, NaN, infinite, and malformed financial values", () => {
      const malformedDoc = {
        id: "fee_malformed_all",
        studentId: "s_malformed",
        amount: -8000,
        amountPaid: -2000,
        amountDue: -6000,
        paymentDetails: {
          paidAmount: NaN as any,
          amount: Infinity as any,
          remainingAmount: -Infinity as any,
        },
      };
      const entity = FeePersistenceMapper.fromFirestore(malformedDoc as any);
      // All negative and non-finite values must be clamped/sanitized to zero
      expect(entity.amountPaid).toBe(0);
      expect(entity.amount).toBe(0);
      expect(entity.amountDue).toBe(0);

      // Malformed non-numeric types
      const stringValuesDoc = {
        id: "fee_strings",
        studentId: "s_strings",
        amount: "seven thousand" as any,
        amountPaid: null as any,
        amountDue: undefined as any,
      };
      const stringEntity = FeePersistenceMapper.fromFirestore(stringValuesDoc as any);
      expect(stringEntity.amountPaid).toBe(0);
      expect(stringEntity.amount).toBe(0);
      expect(stringEntity.amountDue).toBe(0);
    });

    it("should handle missing or malformed payment details safely (NaN, strings, non-objects)", () => {
      const docMalformed = {
        id: "fee_malformed",
        studentId: "s_malformed",
        amount: 5000,
        amountPaid: NaN as any,
        paymentDetails: {
          paidAmount: "five thousand" as any,
          remainingAmount: null as any,
        },
      };
      const entity = FeePersistenceMapper.fromFirestore(docMalformed as any);
      expect(entity.amountPaid).toBe(0);
      expect(entity.amount).toBe(5000);
      expect(entity.amountDue).toBe(5000);
    });

    it("should prevent double-counting across root and nested payment fields", () => {
      const docWithBoth = {
        id: "fee_both",
        studentId: "s_both",
        amount: 10000,
        amountPaid: 4000,
        amountDue: 6000,
        paymentDetails: {
          amount: 10000,
          paidAmount: 4000,
          remainingAmount: 6000,
        },
      };
      const entity = FeePersistenceMapper.fromFirestore(docWithBoth as any);
      // Root fields take precedence and must NOT be added to nested fields
      expect(entity.amountPaid).toBe(4000);
      expect(entity.amount).toBe(10000);
      expect(entity.amountDue).toBe(6000);
    });

    it("should correctly filter fees by month, classGrade, and section in listFees", async () => {
      const mockRepo = {
        findAll: jest.fn().mockResolvedValue([
          {
            id: "f1",
            tenantId: "tenant_1",
            studentId: "s1",
            classGrade: "10",
            section: "A",
            feeMonth: "October",
            amountPaid: 5000,
            metadata: { createdAt: new Date().toISOString() },
          },
          {
            id: "f2",
            tenantId: "tenant_1",
            studentId: "s2",
            classGrade: "9",
            section: "B",
            feeMonth: "September",
            amountPaid: 4500,
            metadata: { createdAt: new Date().toISOString() },
          },
        ]),
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByStudent: jest.fn(),
        getTotalRevenue: jest.fn(),
        getRecentPayments: jest.fn(),
      };

      const feesService = new FeesService(mockRepo as any);
      const filtered = await feesService.listFees("tenant_1", { month: "October", classGrade: "10" });

      expect(filtered.data).toHaveLength(1);
      expect(filtered.data[0].id).toBe("f1");
      expect(filtered.total).toBe(1);
    });

    it("should accept tenantId first in getFeeById", async () => {
      const mockRepo = {
        findById: jest.fn().mockResolvedValue({
          id: "fee_99",
          tenantId: "tenant_1",
          studentId: "s1",
          amountPaid: 3000,
        }),
        findAll: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findByStudent: jest.fn(),
        getTotalRevenue: jest.fn(),
        getRecentPayments: jest.fn(),
      };

      const feesService = new FeesService(mockRepo as any);
      const result = await feesService.getFeeById("tenant_1", "fee_99");

      expect(mockRepo.findById).toHaveBeenCalledWith("fee_99", "tenant_1");
      expect(result?.id).toBe("fee_99");
    });
  });

  describe("Symptom D: Student Advanced Filtering", () => {
    it("should filter students by classGrade, section, and status in StudentService", async () => {
      const mockRepo = {
        findAll: jest.fn().mockResolvedValue([
          { id: "s1", classGrade: "10", section: "A", status: "active", fullName: "Zaid" },
          { id: "s2", classGrade: "10", section: "B", status: "active", fullName: "Bilal" },
          { id: "s3", classGrade: "9", section: "A", status: "active", fullName: "Hamza" },
        ]),
        advancedFilter: jest.fn().mockImplementation(async (tenantId, filter) => {
          let list = [
            { id: "s1", classGrade: "10", section: "A", status: "active", fullName: "Zaid" },
            { id: "s2", classGrade: "10", section: "B", status: "active", fullName: "Bilal" },
            { id: "s3", classGrade: "9", section: "A", status: "active", fullName: "Hamza" },
          ];
          if (filter.classGrade) list = list.filter((s) => s.classGrade === filter.classGrade);
          if (filter.section) list = list.filter((s) => s.section === filter.section);
          return { data: list, total: list.length, page: 1, totalPages: 1 };
        }),
        findById: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        softDelete: jest.fn(),
        paginate: jest.fn(),
      };

      const studentService = new StudentService();
      (studentService as any).repository = mockRepo;

      const result = await studentService.advancedFilter("tenant_1", {
        classGrade: "10",
        section: "A",
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe("s1");
    });
  });

  describe("Symptom A & B: School Configuration Publishing by Admins", () => {
    it("should allow an admin to update a published configuration even if configuredBy is different", async () => {
      const mockRepo = {
        getConfiguration: jest.fn().mockResolvedValue({
          id: "current",
          tenantId: "tenant_1",
          state: "Published",
          version: { number: 1 },
          metadata: { configuredBy: "original_user_creator" },
        }),
        saveConfiguration: jest.fn(),
        saveConfigurationHistory: jest.fn(),
        publishConfiguration: jest.fn().mockResolvedValue(undefined),
      };

      const mockHealth = {
        checkHealth: jest.fn().mockResolvedValue({
          status: "CONFIGURED",
          diagnostics: { tenantValid: true },
        }),
      };

      const mockProvisioning = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: "ay_2026",
          classIds: ["cls_1"],
          sectionIds: ["sec_1"],
          departmentIds: ["dept_1"],
        }),
      };

      const service = new ConfigurationService(mockRepo as any, undefined as any, mockHealth as any, mockProvisioning as any);

      const wizardInput = {
        schoolProfile: { schoolName: "City High", schoolType: "Private", affiliation: "BISE", sections: ["A"] },
        academicStructure: {
          grades: [{ id: "cls_1", name: "Class 1", levelId: "Primary", schemeOfStudy: { subjects: [{ name: "Math" }] } }],
          allSubjects: [{ name: "Math" }],
        },
      };

      // Admin updating with a different user ID
      const result = await service.saveAndPublishConfiguration(
        wizardInput as any,
        "tenant_1",
        "new_admin_user",
        "admin"
      );

      expect(result).toBeDefined();
      expect(result.tenantId).toBe("tenant_1");
    });

    it("should allow schoolAdmin and superAdmin to publish configuration", async () => {
      const mockRepo = {
        getConfiguration: jest.fn().mockResolvedValue(null),
        saveConfiguration: jest.fn(),
        saveConfigurationHistory: jest.fn(),
        publishConfiguration: jest.fn().mockResolvedValue(undefined),
      };

      const mockHealth = {
        checkHealth: jest.fn().mockResolvedValue({ status: "CONFIGURED", diagnostics: { tenantValid: true } }),
      };

      const mockProvisioning = {
        provisionFromConfiguration: jest.fn().mockResolvedValue({
          academicYearId: "ay_2026",
          classIds: ["cls_1"],
          sectionIds: ["sec_1"],
          departmentIds: ["dept_1"],
        }),
      };

      const service = new ConfigurationService(mockRepo as any, undefined as any, mockHealth as any, mockProvisioning as any);
      const wizardInput = {
        schoolProfile: { schoolName: "Grammar School", type: "Private", affiliation: "Federal", sections: ["A"] },
        academicStructure: {
          grades: [{ id: "cls_1", name: "Class 1", levelId: "Primary", schemeOfStudy: { subjects: [{ name: "Science" }] } }],
          allSubjects: [{ name: "Science" }],
        },
      };

      const schoolAdminRes = await service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "u_sadm", "schoolAdmin");
      expect(schoolAdminRes).toBeDefined();

      const superAdminRes = await service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "u_super", "superAdmin");
      expect(superAdminRes).toBeDefined();
    });

    it("should fail closed and reject when userRole is missing, empty, or unknown at service boundary", async () => {
      const mockRepo = { getConfiguration: jest.fn().mockResolvedValue(null) };
      const mockHealth = { checkHealth: jest.fn().mockResolvedValue({ status: "CONFIGURED", diagnostics: { tenantValid: true } }) };
      const service = new ConfigurationService(mockRepo as any, undefined as any, mockHealth as any, undefined as any);

      const wizardInput = {
        schoolProfile: { schoolName: "Hack High", type: "Private", affiliation: "BISE", sections: ["A"] },
        academicStructure: {
          grades: [{ id: "c1", name: "Class 1", schemeOfStudy: { subjects: [{ name: "Art" }] } }],
          allSubjects: [{ name: "Art" }],
        },
      };

      // 1. Missing role (undefined)
      await expect(
        service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "usr_1", undefined)
      ).rejects.toThrow("Configuration Write Violation: Only administrators can create or publish school configuration.");

      // 2. Empty role ("")
      await expect(
        service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "usr_1", "")
      ).rejects.toThrow("Configuration Write Violation: Only administrators can create or publish school configuration.");

      // 3. Unknown role ("intruder", "guest", "malicious_actor")
      await expect(
        service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "usr_1", "intruder")
      ).rejects.toThrow("Configuration Write Violation: Only administrators can create or publish school configuration.");

      await expect(
        service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "usr_1", "guest")
      ).rejects.toThrow("Configuration Write Violation: Only administrators can create or publish school configuration.");
    });

    it("should reject unauthorized standard roles (student, teacher, parent, accountant)", async () => {
      const mockRepo = { getConfiguration: jest.fn().mockResolvedValue(null) };
      const mockHealth = { checkHealth: jest.fn().mockResolvedValue({ status: "CONFIGURED", diagnostics: { tenantValid: true } }) };
      const service = new ConfigurationService(mockRepo as any, undefined as any, mockHealth as any, undefined as any);

      const wizardInput = {
        schoolProfile: { schoolName: "Hack High", type: "Private", affiliation: "BISE", sections: ["A"] },
        academicStructure: {
          grades: [{ id: "c1", name: "Class 1", schemeOfStudy: { subjects: [{ name: "Art" }] } }],
          allSubjects: [{ name: "Art" }],
        },
      };

      const unauthorizedRoles = ["student", "teacher", "parent", "accountant"];
      for (const role of unauthorizedRoles) {
        await expect(
          service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "usr_1", role)
        ).rejects.toThrow("Configuration Write Violation: Only administrators can create or publish school configuration.");
      }
    });

    it("should enforce fail-closed authorization on fresh creation and existing updates regardless of metadata", async () => {
      // 1. Fresh creation attempt without role
      const mockRepo = {
        getConfiguration: jest.fn().mockResolvedValue(null), // fresh creation: no existing config
      };
      const mockHealth = { checkHealth: jest.fn().mockResolvedValue({ status: "CONFIGURED", diagnostics: { tenantValid: true } }) };
      const service = new ConfigurationService(mockRepo as any, undefined as any, mockHealth as any, undefined as any);

      const wizardInput = {
        schoolProfile: { schoolName: "Fresh High", type: "Private", affiliation: "BISE", sections: ["A"] },
        academicStructure: {
          grades: [{ id: "c1", name: "Class 1", schemeOfStudy: { subjects: [{ name: "Art" }] } }],
          allSubjects: [{ name: "Art" }],
        },
      };

      await expect(
        service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "attacker", undefined)
      ).rejects.toThrow("Configuration Write Violation: Only administrators can create or publish school configuration.");

      // 2. Existing configuration update attempt where metadata.configuredBy is missing/undefined
      const existingWithoutConfiguredBy = {
        id: "current",
        tenantId: "tenant_1",
        state: "Published",
        metadata: {
          isConfigured: true,
          configuredBy: undefined, // missing metadata!
          academicYearId: "ay_1",
        },
        version: { number: 1 },
      };
      mockRepo.getConfiguration.mockResolvedValue(existingWithoutConfiguredBy as any);

      await expect(
        service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "attacker", undefined)
      ).rejects.toThrow("Configuration Write Violation: Only administrators can create or publish school configuration.");

      await expect(
        service.saveAndPublishConfiguration(wizardInput as any, "tenant_1", "attacker", "student")
      ).rejects.toThrow("Configuration Write Violation: Only administrators can create or publish school configuration.");
    });

    it("should reject cross-tenant access attempts when tenant health check fails", async () => {
      const mockRepo = { getConfiguration: jest.fn().mockResolvedValue(null) };
      const mockHealth = {
        checkHealth: jest.fn().mockResolvedValue({
          status: "INVALID",
          diagnostics: { tenantValid: false }, // cross-tenant or non-existent tenant
        }),
      };
      const service = new ConfigurationService(mockRepo as any, undefined as any, mockHealth as any, undefined as any);

      const wizardInput = {
        schoolProfile: { schoolName: "Cross Tenant School", type: "Private", affiliation: "BISE", sections: ["A"] },
        academicStructure: {
          grades: [{ id: "c1", name: "Class 1", schemeOfStudy: { subjects: [{ name: "Art" }] } }],
          allSubjects: [{ name: "Art" }],
        },
      };

      await expect(
        service.saveAndPublishConfiguration(wizardInput as any, "foreign_tenant_999", "admin_1", "admin")
      ).rejects.toThrow("Tenant foreign_tenant_999 does not exist or is invalid. Configuration cannot be published.");
    });
  });

  describe("Book Center Route Operations", () => {
    it("should retrieve a book by id and tenantId", async () => {
      const mockBookRepo = {
        findById: jest.fn().mockResolvedValue({
          id: "book_1",
          title: "Physics Vol 1",
          author: "Halliday & Resnick",
          tenantId: "tenant_1",
        }),
        findAll: jest.fn(),
        findByFilter: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };

      const bookService = new BookService(mockBookRepo as any);
      const book = await bookService.getBookById("book_1", "tenant_1");

      expect(mockBookRepo.findById).toHaveBeenCalledWith("book_1", "tenant_1");
      expect(book?.title).toBe("Physics Vol 1");
    });
  });
});
