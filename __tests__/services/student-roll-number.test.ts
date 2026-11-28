import { StudentService } from "@/services/StudentService";

// No live Firestore in unit tests — the service guards fee/section
// provisioning behind `db?.collection`, and adminDb is undefined here.
jest.mock("@/lib/firebase-admin", () => ({ adminDb: undefined }));
// The event bus writes to a Firestore event store; stub it out.
jest.mock("@/lib/events", () => ({ eventBus: { publish: jest.fn() } }));

function makeRepository(overrides: Record<string, unknown> = {}) {
  return {
    findAllRollNumbers: jest.fn().mockResolvedValue([]),
    findByRollNumber: jest.fn().mockResolvedValue(null),
    save: jest.fn().mockImplementation(async (doc: Record<string, unknown>) => ({
      ...doc,
      id: "student-new",
    })),
    findById: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any;
}

function nestedInput(rollNumber?: string | number) {
  return {
    identity: { admissionNumber: "ADM-TEST-1", rollNumber },
    personal: { firstName: "Test", lastName: "Student", gender: "Male" },
    academic: {
      campusId: "main",
      classId: "Class 1",
      sectionId: "A",
      admissionDate: "2026-11-28",
    },
    parentReferences: { primaryParentId: null },
    status: "Active",
  };
}

describe("StudentService roll numbers (B23)", () => {
  test("create without a roll number assigns the smallest missing one", async () => {
    const repository = makeRepository({
      findAllRollNumbers: jest.fn().mockResolvedValue(["1", "2", "4", "103"]),
    });
    const service = new StudentService(repository);

    const created = await service.create(nestedInput(undefined), "tenant-a", "user-1");

    expect(repository.findAllRollNumbers).toHaveBeenCalledWith("tenant-a");
    // Audit case: rolls 1, 2, 4, 103 in use -> the new student gets 3.
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ rollNumber: "3" }),
      "tenant-a"
    );
    expect(created.rollNumber).toBe("3");
  });

  test("create with no students at all assigns roll 1", async () => {
    const repository = makeRepository({
      findAllRollNumbers: jest.fn().mockResolvedValue([]),
    });
    const service = new StudentService(repository);

    await service.create(nestedInput(undefined), "tenant-a", "user-1");

    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ rollNumber: "1" }),
      "tenant-a"
    );
  });

  test("create with an explicit roll number keeps it untouched", async () => {
    const repository = makeRepository({
      findAllRollNumbers: jest.fn().mockResolvedValue(["1", "2", "3"]),
    });
    const service = new StudentService(repository);

    const created = await service.create(nestedInput("7"), "tenant-a", "user-1");

    expect(repository.findAllRollNumbers).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ rollNumber: "7" }),
      "tenant-a"
    );
    expect(created.rollNumber).toBe("7");
  });

  test("update backfills a missing roll number on the next edit", async () => {
    const existing = {
      id: "student-1",
      tenantId: "tenant-a",
      fullName: "No Roll Student",
      classGrade: "Class 1",
      section: "A",
      metadata: {},
      // no rollNumber — the record that renders as "N/A" in the list
    };
    const repository = makeRepository({
      findAllRollNumbers: jest.fn().mockResolvedValue(["1", "2", "4"]),
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new StudentService(repository);

    await service.update("tenant-a", "student-1", { fullName: "No Roll Student" }, "user-1");

    expect(repository.update).toHaveBeenCalledWith(
      "student-1",
      expect.objectContaining({ rollNumber: "3" }),
      "tenant-a"
    );
  });

  test("update never renumbers a student who already has a roll", async () => {
    const existing = {
      id: "student-1",
      tenantId: "tenant-a",
      fullName: "Has Roll",
      classGrade: "Class 1",
      section: "A",
      rollNumber: "46",
      metadata: {},
    };
    const repository = makeRepository({
      findAllRollNumbers: jest.fn(),
      findById: jest.fn().mockResolvedValue(existing),
    });
    const service = new StudentService(repository);

    await service.update("tenant-a", "student-1", { fullName: "Has Roll" }, "user-1");

    expect(repository.findAllRollNumbers).not.toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(
      "student-1",
      expect.objectContaining({ rollNumber: "46" }),
      "tenant-a"
    );
  });
});
