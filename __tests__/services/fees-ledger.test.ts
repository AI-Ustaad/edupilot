import { FeesService } from "@/services/fees.service";

describe("FeesService Ledger Synchronization (DEF-012)", () => {
  let mockFeesRepo: any;
  let mockLedgerService: any;

  beforeEach(() => {
    mockFeesRepo = {
      save: jest.fn().mockImplementation(async (doc) => ({ id: "fee-123", ...doc })),
      findById: jest.fn().mockImplementation(async (id, tenantId) => ({
        id,
        tenantId,
        studentId: "student-1",
        amountPaid: 7500,
        feeMonth: "October 2026",
      })),
    };

    mockLedgerService = {
      createEntry: jest.fn().mockResolvedValue("ledger-entry-1"),
    };
  });

  it("synchronizes an income entry to LedgerService when fee is created", async () => {
    const service = new FeesService(mockFeesRepo, mockLedgerService);

    const result = await service.createFee(
      {
        studentId: "student-1",
        studentName: "Zain Malik",
        feeMonth: "October 2026",
        amountPaid: 7500,
        paymentMethod: "Cash",
      },
      "tenant-alpha",
      "user-admin"
    );

    expect(result).toBeDefined();
    expect(mockLedgerService.createEntry).toHaveBeenCalledTimes(1);
    expect(mockLedgerService.createEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "income",
        description: expect.stringContaining("Zain Malik"),
        amount: 7500,
        tenantId: "tenant-alpha",
        createdBy: "user-admin",
      }),
      "tenant-alpha"
    );
  });

  it("does not abort fee creation if ledger entry creation fails", async () => {
    mockLedgerService.createEntry = jest.fn().mockRejectedValue(new Error("Database ledger timeout"));
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const service = new FeesService(mockFeesRepo, mockLedgerService);

    const result = await service.createFee(
      {
        studentId: "student-1",
        studentName: "Zain Malik",
        feeMonth: "October 2026",
        amountPaid: 7500,
        paymentMethod: "Cash",
      },
      "tenant-alpha",
      "user-admin"
    );

    expect(result).toBeDefined();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });
});

