import { createInMemoryFirestore } from "@/__tests__/utils/inmemory-firestore";
import { ConfigurationService } from "@/services/configuration.service";
import { ConfigurationDashboardService } from "@/services/configuration-dashboard.service";
import { ConfigurationProvisioningService } from "@/services/configuration-provisioning.service";
import { AcademicYearRepository } from "@/repositories/academic-year.repository";
import { SectionRepository } from "@/repositories/section.repository";
import { DepartmentRepository } from "@/repositories/department.repository";
import { ConfigurationRepository } from "@/repositories/configuration.repository";
import { ClassRepository } from "@/repositories/class.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import { ParentsRepository } from "@/repositories/parents.repository";
import { RoomRepository } from "@/repositories/room.repository";
import { BuildingRepository } from "@/repositories/building.repository";
import { FacilityRepository } from "@/repositories/facility.repository";
import { LibraryRepository } from "@/repositories/library.repository";
import { TransportRepository } from "@/repositories/transport.repository";
import { HostelRepository } from "@/repositories/hostel.repository";
import { FeeStructureRepository } from "@/repositories/fee-structure.repository";
import { HouseRepository } from "@/repositories/house.repository";
import { ShiftRepository } from "@/repositories/shift.repository";
import { GradingRepository } from "@/repositories/grading.repository";
import type { MasterSchoolConfiguration } from "@/types/configuration";
import type { WizardInput } from "@/types/configuration/wizard";

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

function buildWizardInput(overrides?: Partial<WizardInput>): WizardInput {
  return {
    schoolProfile: {
      name: "Integration Test School",
      type: "Private",
      curriculumId: "federal",
      boardName: "FBISE",
      country: "PK",
      sections: ["A", "B"],
    },
    academicStructure: {
      levels: [{ id: "primary", name: "Primary" }],
      grades: [
        { id: "cls_1", name: "1", levelId: "primary", schemeOfStudy: { subjects: [{ name: "Math" }, { name: "English" }] } },
        { id: "cls_2", name: "2", levelId: "primary", schemeOfStudy: { subjects: [{ name: "Math" }, { name: "English" }, { name: "Science" }] } },
      ],
      allSubjects: [{ name: "Math" }, { name: "English" }, { name: "Science" }],
      requiredLabs: [],
      requiredTeachers: {},
      departments: ["Computer Science", "Mathematics"],
    },
    ...overrides,
  };
}

function buildConfigurationService(): ConfigurationService {
  return new ConfigurationService(
    new ConfigurationRepository(),
    new (require("@/services/configuration-cache.service").ConfigurationCacheService)(),
    new (require("@/services/configuration-health.service").ConfigurationHealthService)(),
    new ConfigurationProvisioningService(
      new AcademicYearRepository(),
      new SectionRepository(),
      new DepartmentRepository()
    )
  );
}

function buildDashboardService(): ConfigurationDashboardService {
  return new ConfigurationDashboardService(
    new ConfigurationRepository(),
    new AcademicYearRepository(),
    new ClassRepository(),
    new SectionRepository(),
    new StudentRepository(),
    new StaffRepository(),
    new ParentsRepository(),
    new RoomRepository(),
    new BuildingRepository(),
    new FacilityRepository(),
    new LibraryRepository(),
    new TransportRepository(),
    new HostelRepository(),
    new FeeStructureRepository(),
    new HouseRepository(),
    new ShiftRepository(),
    new GradingRepository(),
    new DepartmentRepository()
  );
}

async function getDoc(tenantId: string, collection: string, docId?: string): Promise<any> {
  const db = getDb();
  if (docId) {
    const snap = await db.collection(collection).doc(docId).get();
    return snap.exists ? { id: snap.id, ...snap.data() } : null;
  }
  const snap = await db.collection(collection).where("tenantId", "==", tenantId).get();
  return snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
}

async function ensureTenant(tenantId: string): Promise<void> {
  const db = getDb();
  await db.collection("tenants").doc(tenantId).set({
    id: tenantId,
    name: `Test Tenant ${tenantId}`,
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });
}

describe("Configuration Provisioning — End-to-End Integration", () => {
  beforeEach(() => {
    getDb().clear();
  });

  test("STEP 2: complete Save → Provision → Firestore → Dashboard READ path", async () => {
    const service = buildConfigurationService();
    const dashboardService = buildDashboardService();
    const tenantId = "tenant-e2e-1";
    const userId = "user-e2e-1";

    await ensureTenant(tenantId);

    // 1. Create and publish configuration
    const input = buildWizardInput();
    const result = await service.saveAndPublishConfiguration(input, tenantId, userId);

    // Verify configuration was saved
    expect(result).toBeDefined();
    expect(result.tenantId).toBe(tenantId);
    expect(result.state).toBe("Published");
    expect(result.metadata.isConfigured).toBe(true);
    expect(result.metadata.academicYearId).toBeTruthy();

    // 2. Read Academic Year from Firestore
    const academicYears = await getDoc(tenantId, "academicYears") as any[];
    expect(academicYears.length).toBe(1);
    const ay = academicYears[0];
    expect(ay.tenantId).toBe(tenantId);
    expect(ay.isCurrent).toBe(true);
    expect(ay.name).toBe(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);
    expect(ay.id).toBe(result.metadata.academicYearId);

    // 3. Read Sections from Firestore
    const sections = await getDoc(tenantId, "sections") as any[];
    // 2 classes * 2 sections = 4 sections
    expect(sections.length).toBe(4);
    const sectionTenantIds = new Set(sections.map((s: any) => s.tenantId));
    expect(sectionTenantIds.size).toBe(1);
    expect(sectionTenantIds.has(tenantId)).toBe(true);

    // Verify section normalization and no duplicates
    const sectionKeys = new Set(sections.map((s: any) => `${s.classGrade}::${s.sectionName}`.toLowerCase()));
    expect(sectionKeys.size).toBe(4);
    expect(sectionKeys.has("1::a")).toBe(true);
    expect(sectionKeys.has("1::b")).toBe(true);
    expect(sectionKeys.has("2::a")).toBe(true);
    expect(sectionKeys.has("2::b")).toBe(true);

    // Verify all sections have deleted: false
    sections.forEach((s: any) => {
      expect(s.deleted).toBe(false);
    });

    // 4. Read Departments from Firestore
    const departments = await getDoc(tenantId, "departments") as any[];
    expect(departments.length).toBe(2);
    const deptTenantIds = new Set(departments.map((d: any) => d.tenantId));
    expect(deptTenantIds.size).toBe(1);
    expect(deptTenantIds.has(tenantId)).toBe(true);

    // Verify department normalization and no duplicates
    const deptKeys = new Set(departments.map((d: any) => d.name.toLowerCase().trim()));
    expect(deptKeys.size).toBe(2);
    expect(deptKeys.has("computer science")).toBe(true);
    expect(deptKeys.has("mathematics")).toBe(true);

    // 5. Read configuration again
    const config = await service.getConfiguration(tenantId);
    expect(config).toBeDefined();
    expect(config?.metadata.academicYearId).toBe(ay.id);
    expect(config?.school.name).toBe("Integration Test School");

    // 6. Execute DashboardService
    const metrics = await dashboardService.getDashboardMetrics(tenantId);

    // 7. Verify dashboard metrics
    expect(metrics.academicYearCount).toBe(1);
    expect(metrics.configuredClasses).toBe(2); // 2 distinct class grades
    expect(metrics.configuredSections).toBe(4); // 4 section documents
    expect(metrics.configuredTeachers).toBe(0); // no staff provisioned
    expect(metrics.configuredStudents).toBe(0); // no students provisioned
    expect(metrics.schoolInfo?.name).toBe("Integration Test School");
    expect(metrics.configurationCompletion.percentage).toBeGreaterThan(0);
    expect(metrics.configurationCompletion.completed).toBeGreaterThan(0);
  });

  test("STEP 3: idempotency — re-publish produces no duplicates", async () => {
    const service = buildConfigurationService();
    const tenantId = "tenant-idempotent-1";
    const userId = "user-idempotent-1";

    await ensureTenant(tenantId);

    const input = buildWizardInput();

    // First publish
    const r1 = await service.saveAndPublishConfiguration(input, tenantId, userId);
    const ayId1 = r1.metadata.academicYearId;

    // Second publish
    const r2 = await service.saveAndPublishConfiguration(input, tenantId, userId);
    const ayId2 = r2.metadata.academicYearId;

    // Academic year ID remains stable
    expect(ayId1).toBe(ayId2);

    // No duplicate academic years
    const academicYears = await getDoc(tenantId, "academicYears") as any[];
    expect(academicYears.length).toBe(1);
    expect(academicYears.filter((a: any) => a.isCurrent).length).toBe(1);

    // No duplicate sections
    const sections = await getDoc(tenantId, "sections") as any[];
    expect(sections.length).toBe(4);

    // No duplicate departments
    const departments = await getDoc(tenantId, "departments") as any[];
    expect(departments.length).toBe(2);

    // Soft-deleted sections are NOT resurrected
    const db = getDb();
    await db.collection("sections").doc("tenant-idempotent-1__1__a").update({
      deleted: true,
      deletedAt: "2024-01-01T00:00:00.000Z",
      deletedBy: "admin",
    });

    const r3 = await service.saveAndPublishConfiguration(input, tenantId, userId);
    const sectionsAfter = await getDoc(tenantId, "sections") as any[];
    const softA = sectionsAfter.find((s: any) => s.classGrade === "1" && s.sectionName.toLowerCase() === "a");
    expect(softA).toBeDefined();
    expect(softA.deleted).toBe(true);
    expect(sectionsAfter.length).toBe(4); // still 4, no new one created
  });

  test("STEP 4: tenant isolation — Tenant A cannot see Tenant B records", async () => {
    const service = buildConfigurationService();
    const dashboardService = buildDashboardService();

    await ensureTenant("tenant-iso-a");
    await ensureTenant("tenant-iso-b");

    const inputA = buildWizardInput({ schoolProfile: { ...buildWizardInput().schoolProfile!, name: "School A" } });
    const inputB = buildWizardInput({ schoolProfile: { ...buildWizardInput().schoolProfile!, name: "School B" } });

    // Provision Tenant A
    await service.saveAndPublishConfiguration(inputA, "tenant-iso-a", "user-a");

    // Provision Tenant B
    await service.saveAndPublishConfiguration(inputB, "tenant-iso-b", "user-b");

    // Tenant A dashboard metrics should not include Tenant B records
    const metricsA = await dashboardService.getDashboardMetrics("tenant-iso-a");
    expect(metricsA.academicYearCount).toBe(1);
    expect(metricsA.configuredSections).toBe(4);
    expect(metricsA.schoolInfo?.name).toBe("School A");

    // Tenant B dashboard metrics should not include Tenant A records
    const metricsB = await dashboardService.getDashboardMetrics("tenant-iso-b");
    expect(metricsB.academicYearCount).toBe(1);
    expect(metricsB.configuredSections).toBe(4);
    expect(metricsB.schoolInfo?.name).toBe("School B");

    // Verify no cross-tenant data in Firestore
    const sectionsA = await getDoc("tenant-iso-a", "sections") as any[];
    const sectionsB = await getDoc("tenant-iso-b", "sections") as any[];
    expect(sectionsA.every((s: any) => s.tenantId === "tenant-iso-a")).toBe(true);
    expect(sectionsB.every((s: any) => s.tenantId === "tenant-iso-b")).toBe(true);
  });

  test("STEP 5: GET after successful save returns the same published configuration", async () => {
    const service = buildConfigurationService();
    const tenantId = "tenant-readback-1";
    const userId = "user-readback-1";

    await ensureTenant(tenantId);

    const input = buildWizardInput();
    const published = await service.saveAndPublishConfiguration(input, tenantId, userId);

    expect(published.state).toBe("Published");
    expect(published.metadata.isConfigured).toBe(true);
    expect(published.metadata.academicYearId).toBeTruthy();

    // Read back via getConfiguration (bypasses viewModel mapping)
    const config = await service.getConfiguration(tenantId);
    expect(config).toBeDefined();
    expect(config!.state).toBe("Published");
    expect(config!.metadata.isConfigured).toBe(true);
    expect(config!.metadata.academicYearId).toBe(published.metadata.academicYearId);
    expect(config!.school.name).toBe("Integration Test School");

    // Read back via loadConfiguration (health + cache path)
    const loadResult = await service.loadConfiguration(tenantId);
    expect(loadResult.status).toBe("CONFIGURED");
    expect(loadResult.configuration).toBeDefined();
    expect(loadResult.configuration!.state).toBe("Published");
    expect(loadResult.configuration!.metadata.academicYearId).toBe(published.metadata.academicYearId);
  });

  test("STEP 5: API response contract — hook consumes exact API response shape", async () => {
    const service = buildConfigurationService();
    const tenantId = "tenant-contract-1";
    const userId = "user-contract-1";

    await ensureTenant(tenantId);

    await service.saveAndPublishConfiguration(buildWizardInput(), tenantId, userId);

    // Simulate the API route response
    const { createSuccessResponse } = require("@/lib/api/response");
    const dashboardService = buildDashboardService();
    const metrics = await dashboardService.getDashboardMetrics(tenantId);
    const apiResponse = createSuccessResponse(metrics);

    // Parse response as the hook would
    const parsed = await apiResponse.json();
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBeDefined();
    expect(parsed.data.schoolInfo).toBeDefined();
    expect(parsed.data.configurationCompletion).toBeDefined();
    expect(parsed.data.academicYearCount).toBe(1);

    // Simulate hook unwrapping: res?.data?.data ?? res?.data
    const payload = parsed?.data?.data ?? parsed?.data;
    const { safeObject } = require("@/lib/api/safeResponse");
    const unwrapped = safeObject(payload);

    // Verify the hook receives the correct shape
    expect(unwrapped.schoolInfo?.name).toBe("Integration Test School");
    expect(unwrapped.academicYearCount).toBe(1);
    expect(unwrapped.configuredSections).toBe(4);
    expect(unwrapped.configurationCompletion.percentage).toBeGreaterThan(0);
  });
});
