// __tests__/services/cascade-delete-wiring-n28.test.ts
// N28 — the service delete paths must actually call the cascade.
import { StudentService } from "@/services/StudentService";
import { StaffService } from "@/services/StaffService";
import { cascadeDeleteStudent, cascadeDeleteStaff } from "@/lib/deletion/cascade";
import { eventBus } from "@/lib/events";

jest.mock("@/lib/deletion/cascade", () => ({
  cascadeDeleteStudent: jest.fn().mockResolvedValue({ fees: 1, parents: 1 }),
  cascadeDeleteStaff: jest.fn().mockResolvedValue({ leave_requests: 1, payroll: 1 }),
}));
jest.mock("@/lib/events", () => ({
  eventBus: { publish: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock("@/lib/cache", () => ({
  invalidateCache: jest.fn().mockResolvedValue(undefined),
}));

const mockedCascadeDeleteStudent = cascadeDeleteStudent as unknown as jest.Mock;
const mockedCascadeDeleteStaff = cascadeDeleteStaff as unknown as jest.Mock;
const mockedPublish = (eventBus as any).publish as jest.Mock;

describe("N28 StudentService.delete wiring", () => {
  it("deletes the student, then cascades with the repository db", async () => {
    const fakeDb = { marker: "repo-db" };
    const repository = {
      delete: jest.fn().mockResolvedValue(undefined),
      db: fakeDb,
    } as any;
    const service = new StudentService(repository);

    await service.delete("tenant-a", "student-1", "user-1");

    expect(repository.delete).toHaveBeenCalledWith("student-1", "tenant-a");
    expect(mockedCascadeDeleteStudent).toHaveBeenCalledWith(fakeDb, "tenant-a", "student-1");
    expect(mockedPublish).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: "tenant-a",
        studentId: "student-1",
        studentData: expect.objectContaining({ cascade: { fees: 1, parents: 1 } }),
      }),
      "tenant-a"
    );
  });

  it("hardDelete cascades the same way (admin delete route)", async () => {
    const fakeDb = { marker: "repo-db" };
    const repository = {
      delete: jest.fn().mockResolvedValue(undefined),
      db: fakeDb,
    } as any;
    const service = new StudentService(repository);

    await service.hardDelete("tenant-a", "student-1", "user-1");

    expect(repository.delete).toHaveBeenCalledWith("student-1", "tenant-a");
    expect(mockedCascadeDeleteStudent).toHaveBeenCalledWith(fakeDb, "tenant-a", "student-1");
  });
});

describe("N28 StaffService.delete wiring", () => {
  it("deletes the staff member, then cascades with their full name", async () => {
    const fakeDb = { marker: "repo-db" };
    const repository = {
      findById: jest.fn().mockResolvedValue({
        id: "stf-1",
        tenantId: "tenant-a",
        personal: { fullName: "Test Teacher" },
      }),
      delete: jest.fn().mockResolvedValue(undefined),
      db: fakeDb,
    } as any;
    const service = new StaffService(repository);

    await service.delete("tenant-a", "stf-1", "user-1");

    expect(repository.delete).toHaveBeenCalledWith("stf-1", "tenant-a");
    expect(mockedCascadeDeleteStaff).toHaveBeenCalledWith(
      fakeDb,
      "tenant-a",
      "stf-1",
      "Test Teacher"
    );
    expect(mockedPublish).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ staffId: "stf-1", tenantId: "tenant-a" }),
      "tenant-a"
    );
  });
});
