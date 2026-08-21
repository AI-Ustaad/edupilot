import { createInMemoryFirestore } from "@/__tests__/utils/inmemory-firestore";
import { ConfigurationProvisioningService } from "@/services/configuration-provisioning.service";
import { SectionRepository } from "@/repositories/section.repository";
import { DepartmentRepository } from "@/repositories/department.repository";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import type { MasterSchoolConfiguration } from "@/types/configuration";

jest.mock("@/lib/firebase-admin", () => {
  const { createInMemoryFirestore } = require("@/__tests__/utils/inmemory-firestore");
  const db = createInMemoryFirestore();
  return {
    adminDb: db,
    adminAuth: { verifyIdToken: jest.fn(), getUser: jest.fn() },
    adminStorage: {},
    dbTimestamp: "2024-01-01T00:00:00.000Z",
    __db: db,
  };
});

function getDb(): any {
  const { adminDb } = require("@/lib/firebase-admin");
  return adminDb;
}

function buildService() {
  return new ConfigurationProvisioningService(
    new AcademicYearRepository(),
    new SectionRepository(),
    new DepartmentRepository()
  );
}

function baseConfig(overrides?: Partial<MasterSchoolConfiguration>): MasterSchoolConfiguration {
  return {
    id: "current",
    tenantId: "tenant-A",
    state: "Published",
    metadata: {
      tenantId: "tenant-A",
      schemaVersion: 2,
      configurationVersion: 1,
      environment: "development",
      region: "default",
      timezone: "UTC",
      academicYearId: null,
      currentSnapshotId: null,
      isConfigured: true,
      lastModified: "2024-01-01T00:00:00.000Z",
    },
    version: { id: "v_1", number: 1, createdBy: "u1", createdAt: "2024-01-01T00:00:00.000Z", reason: "init", checksum: "x" },
    school: { name: "Test School", type: "Private", curriculumId: "federal", boardName: "FBISE", country: "PK" },
    academic: {
      levels: ["Primary"],
      classes: [{ id: "cls_10", name: "10", level: "Primary", subjects: ["Math", "English"] }],
      sectionNames: ["A", "B", "C"],
      subjects: ["Math", "English"],
      requiredLabs: [],
      requiredTeachers: {},
      departments: ["Computer Science"],
    },
    features: {
      ai: { enabled: true, version: "1", permissions: [], beta: false, providers: [], activeProvider: "", quota: 0 },
      library: { enabled: true, version: "1", permissions: [], beta: false },
      transport: { enabled: false, version: "1", permissions: [], beta: false },
      fees: { enabled: true, version: "1", permissions: [], beta: false },
      attendance: { enabled: true, version: "1", permissions: [], beta: false },
      exams: { enabled: true, version: "1", permissions: [], beta: false },
    },
    ...overrides,
  };
}

async function sectionsSnapshot(tenantId: string): Promise<any[]> {
  const db = getDb();
  const snap = await db.collection("sections").where("tenantId", "==", tenantId).get();
  return snap.docs.map((d: any) => d.data());
}

async function academicYearsSnapshot(tenantId: string): Promise<any[]> {
  const db = getDb();
  const snap = await db.collection("academicYears").where("tenantId", "==", tenantId).get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

describe("ConfigurationProvisioningService (integration, in-memory Firestore)", () => {
  beforeEach(() => {
    getDb().clear();
  });

  test("new section is created with deleted:false and subjects initialized", async () => {
    const service = buildService();
    const db = getDb();
    await db.collection("sections").add({ classGrade: "10", sectionName: "A", tenantId: "tenant-A", deleted: true, deletedBy: "admin", subjects: { core: ["Physics"], electives: [] } });
    await db.collection("sections").add({ classGrade: "10", sectionName: "B", tenantId: "tenant-A", deleted: false, incharge: "teacher-2", subjects: { core: ["Chemistry"], electives: ["Drama"] } });

    const result = await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");

    const sections = await sectionsSnapshot("tenant-A");
    const byKey = new Map<string, any>(sections.map(s => [`${s.classGrade}::${s.sectionName}`.toLowerCase(), s]));
    const newC = byKey.get("10::c");
    expect(newC).toBeDefined();
    expect(newC.deleted).toBe(false);
    expect(newC.subjects).toEqual({ core: ["Math", "English"], electives: [] });
    const softA = byKey.get("10::a");
    expect(softA.deleted).toBe(true);
    expect(softA.subjects).toEqual({ core: ["Physics"], electives: [] });
    const activeB = byKey.get("10::b");
    expect(activeB.deleted).toBe(false);
    expect(activeB.incharge).toBe("teacher-2");
    expect(activeB.subjects).toEqual({ core: ["Chemistry"], electives: ["Drama"] });
    expect(result.sectionsCreated).toBe(1);
  });

  test("soft-deleted section is NOT resurrected and its fields are preserved", async () => {
    const service = buildService();
    const db = getDb();
    await db.collection("sections").add({ classGrade: "10", sectionName: "A", tenantId: "tenant-A", deleted: true, deletedAt: "2024-01-01T00:00:00.000Z", deletedBy: "admin", subjects: { core: ["Original"], electives: [] } });

    const result = await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");

    expect(result.sectionsCreated).toBe(2);
    const sections = await sectionsSnapshot("tenant-A");
    const softA = sections.find(s => `${s.classGrade}::${s.sectionName}`.toLowerCase() === "10::a");
    expect(softA.deleted).toBe(true);
    expect(softA.deletedAt).toBe("2024-01-01T00:00:00.000Z");
    expect(softA.deletedBy).toBe("admin");
    expect(softA.subjects).toEqual({ core: ["Original"], electives: [] });
  });

  test("re-running provisioning is idempotent and never resurrects deleted sections", async () => {
    const service = buildService();
    const db = getDb();
    await db.collection("sections").add({ classGrade: "10", sectionName: "A", tenantId: "tenant-A", deleted: true, subjects: { core: ["Original"], electives: [] } });

    await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");
    const result2 = await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");

    expect(result2.sectionsCreated).toBe(0);
    const sections = await sectionsSnapshot("tenant-A");
    const softA = sections.find(s => `${s.classGrade}::${s.sectionName}`.toLowerCase() === "10::a");
    expect(softA.deleted).toBe(true);
  });

  test("section whitespace/case variants resolve to the same existing record", async () => {
    const service = buildService();
    const db = getDb();
    await db.collection("sections").add({ classGrade: "10", sectionName: "A", tenantId: "tenant-A", deleted: false, subjects: { core: ["KeepMe"], electives: [] } });

    const cfg = baseConfig({ academic: { ...baseConfig().academic, sectionNames: [" a ", "B", "C"] } });
    const result = await service.provisionFromConfiguration("tenant-A", cfg, "u1");

    expect(result.sectionsCreated).toBe(2);
    const sections = await sectionsSnapshot("tenant-A");
    const kept = sections.find(s => `${s.classGrade}::${s.sectionName}`.toLowerCase() === "10::a");
    expect(kept.subjects).toEqual({ core: ["KeepMe"], electives: [] });
  });

  test("tenant isolation: another tenant's sections are invisible to this tenant", async () => {
    const service = buildService();
    const db = getDb();
    await db.collection("sections").add({ classGrade: "10", sectionName: "A", tenantId: "tenant-A", deleted: false });
    await db.collection("sections").add({ classGrade: "10", sectionName: "B", tenantId: "tenant-A", deleted: false });
    await db.collection("sections").add({ classGrade: "10", sectionName: "A", tenantId: "tenant-B", deleted: false });

    const resultA = await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");
    expect(resultA.sectionsCreated).toBe(1);

    await service.provisionFromConfiguration("tenant-B", baseConfig({ tenantId: "tenant-B", metadata: { ...baseConfig().metadata, tenantId: "tenant-B" }, academic: { ...baseConfig().academic, sectionNames: ["A"] } }), "u1");
    const sectionsB = await sectionsSnapshot("tenant-B");
    expect(sectionsB.length).toBe(1);
    expect(sectionsB[0].tenantId).toBe("tenant-B");
    const sectionsA = await sectionsSnapshot("tenant-A");
    expect(sectionsA.every(s => s.tenantId === "tenant-A")).toBe(true);
  });

  test("academicYearId handoff: result carries the provisioned academic year id", async () => {
    const service = buildService();
    const result = await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");

    expect(result.academicYearId).toBeTruthy();
    const ays = await academicYearsSnapshot("tenant-A");
    const found = ays.find(a => a.id === result.academicYearId);
    expect(found).toBeDefined();
    expect(found.isCurrent).toBe(true);
  });

  test("service does NOT mutate config.metadata.academicYearId (Phase 3 integration deferred)", async () => {
    const service = buildService();
    const config = baseConfig();
    await service.provisionFromConfiguration("tenant-A", config, "u1");
    expect(config.metadata.academicYearId).toBeNull();
  });

  test("academicYearId is reused across re-provisioning (idempotent)", async () => {
    const service = buildService();
    const r1 = await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");
    const r2 = await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");
    expect(r1.academicYearId).toBe(r2.academicYearId);
    const ays = await academicYearsSnapshot("tenant-A");
    expect(ays.filter(a => a.isCurrent)).toHaveLength(1);
  });

  test("department create-if-absent: existing department is reused, not re-created", async () => {
    const service = buildService();
    const db = getDb();
    await db.collection("departments").add({ name: "Computer Science", code: "CS", tenantId: "tenant-A", deleted: false, headOfDepartment: "ops-hod" });

    const result = await service.provisionFromConfiguration("tenant-A", baseConfig(), "u1");
    expect(result.departmentsCreated).toBe(0);

    const snap = await db.collection("departments").where("tenantId", "==", "tenant-A").get();
    const dept = snap.docs[0].data();
    expect(dept.headOfDepartment).toBe("ops-hod");
  });

  test("department normalization prevents duplicates (computer science  ==  CS  ==  COMPUTER SCIENCE)", async () => {
    const service = buildService();
    const db = getDb();
    await db.collection("departments").add({ name: "Computer Science", code: "CS", tenantId: "tenant-A", deleted: false });

    const cfg = baseConfig({ academic: { ...baseConfig().academic, departments: ["COMPUTER SCIENCE", " computer science "] } });
    const result = await service.provisionFromConfiguration("tenant-A", cfg, "u1");
    expect(result.departmentsCreated).toBe(0);
    const snap = await db.collection("departments").where("tenantId", "==", "tenant-A").get();
    expect(snap.size).toBe(1);
  });

  test("concurrent provisioning of the same configuration is safe", async () => {
    const service = buildService();
    const [r1, r2] = await Promise.all([
      service.provisionFromConfiguration("tenant-A", baseConfig(), "u1"),
      service.provisionFromConfiguration("tenant-A", baseConfig(), "u1"),
    ]);
    const createdTotal = Math.max(r1.sectionsCreated, r2.sectionsCreated);
    expect(createdTotal).toBe(3);
    const sections = await sectionsSnapshot("tenant-A");
    const keys = new Set(sections.map(s => `${s.classGrade}::${s.sectionName}`.toLowerCase()));
    expect(keys.size).toBe(3);
    expect([...keys]).toEqual(expect.arrayContaining(["10::a", "10::b", "10::c"]));
  });

  test("configuration update adds only new sections, preserves existing", async () => {
    const service = buildService();
    const db = getDb();
    await db.collection("sections").add({ classGrade: "10", sectionName: "A", tenantId: "tenant-A", deleted: false, incharge: "kept", subjects: { core: ["X"], electives: [] } });

    await service.provisionFromConfiguration("tenant-A", baseConfig({ academic: { ...baseConfig().academic, sectionNames: ["A"] } }), "u1");
    await service.provisionFromConfiguration("tenant-A", baseConfig({ academic: { ...baseConfig().academic, sectionNames: ["A", "D", "E"] } }), "u1");

    const sections = await sectionsSnapshot("tenant-A");
    const byKey = new Map<string, any>(sections.map(s => [`${s.classGrade}::${s.sectionName}`.toLowerCase(), s]));
    expect(byKey.get("10::a").incharge).toBe("kept");
    expect(byKey.has("10::d")).toBe(true);
    expect(byKey.has("10::e")).toBe(true);
    expect(byKey.get("10::a").deleted).toBe(false);
  });
});
