import {
  ConfigurationRepository,
} from "@/repositories/configuration.repository";
import {
  AcademicYearRepository,
} from "@/repositories/academic-year.repository";
import { ClassRepository } from "@/repositories/class.repository";
import { SectionRepository } from "@/repositories/section.repository";
import { StudentRepository } from "@/repositories/student.repository";
import { StaffRepository } from "@/repositories/staff.repository";
import { ParentsRepository } from "@/repositories/parents.repository";
import type {
  IConfigurationDashboardService,
  ConfigurationDashboardMetrics,
} from "@/interfaces/IConfigurationDashboardService";
import type { MasterSchoolConfiguration } from "@/types/configuration";

export class ConfigurationDashboardService
  implements IConfigurationDashboardService
{
  constructor(
    private readonly configurationRepo: ConfigurationRepository,
    private readonly academicYearRepo: AcademicYearRepository,
    private readonly classRepo: ClassRepository,
    private readonly sectionRepo: SectionRepository,
    private readonly studentRepo: StudentRepository,
    private readonly staffRepo: StaffRepository,
    private readonly parentRepo: ParentsRepository
  ) {}

  async getDashboardMetrics(
    tenantId: string
  ): Promise<ConfigurationDashboardMetrics> {
    const [config, counts] = await Promise.all([
      this.configurationRepo.getConfiguration(tenantId),
      this.getCounts(tenantId),
    ]);
    const completion = this.calcCompletion(
      tenantId,
      config as MasterSchoolConfiguration | null,
      counts
    );

    return {
      schoolInfo: config?.school || null,
      academicYearCount: counts.academicYear,
      configuredClasses: counts.classes,
      configuredSections: counts.sections,
      configuredSubjects: config?.academic?.subjects?.length || 0,
      configuredTeachers: counts.staff,
      configuredStaff: counts.staff,
      configuredStudents: counts.students,
      configuredParents: counts.parents,
      configuredRooms: counts.rooms,
      configuredBuildings: counts.buildings,
      configuredFacilities: counts.facilities,
      libraryStatus: counts.library > 0 ? "Configured" : "Not Configured",
      transportStatus: counts.transport > 0 ? "Configured" : "Not Configured",
      hostelStatus: counts.hostel > 0 ? "Configured" : "Not Configured",
      feeConfiguration: counts.feeStructure > 0 ? "Configured" : "Not Configured",
      configurationCompletion: completion,
      warnings:
        completion.missing.length > 0
          ? `Missing: ${completion.missing.join(", ")}`
          : "All modules configured",
      missingConfigurations: completion.missing,
      totalCount: completion.total,
      completedCount: completion.completed,
    };
  }

  async refreshDashboardStats(_tenantId: string): Promise<void> {
    return;
  }

  private async getCounts(
    tenantId: string
  ): Promise<{
    academicYear: number;
    classes: number;
    sections: number;
    students: number;
    staff: number;
    parents: number;
    rooms: number;
    buildings: number;
    facilities: number;
    library: number;
    transport: number;
    hostel: number;
    feeStructure: number;
    houses: number;
    shifts: number;
    grading: number;
    departments: number;
  }> {
    const [
      academicYear,
      classes,
      sections,
      students,
      staffList,
      parentsList,
    ] = await Promise.all([
      this.academicYearRepo.findAllByTenant(tenantId).catch(() => []),
      this.classRepo.getAll(tenantId).catch(() => []),
      this.sectionRepo.findAllActive(tenantId).catch(() => []),
      this.studentRepo.count(tenantId).catch(() => 0),
      this.staffRepo.findAll(tenantId).catch(() => []),
      this.parentRepo.findAll(tenantId).catch(() => []),
    ]);

    return {
      academicYear: academicYear.length,
      classes: Array.isArray(classes) ? classes.length : 0,
      sections: Array.isArray(sections) ? sections.length : 0,
      students,
      staff: Array.isArray(staffList) ? staffList.length : 0,
      parents: Array.isArray(parentsList) ? parentsList.length : 0,
      rooms: 0,
      buildings: 0,
      facilities: 0,
      library: 0,
      transport: 0,
      hostel: 0,
      feeStructure: 0,
      houses: 0,
      shifts: 0,
      grading: 0,
      departments: 0,
    };
  }

  private calcCompletion(
    tenantId: string,
    config: MasterSchoolConfiguration | null,
    counts: {
      academicYear: number;
      classes: number;
      sections: number;
      students: number;
      staff: number;
      parents: number;
      rooms: number;
      buildings: number;
      facilities: number;
      library: number;
      transport: number;
      hostel: number;
      feeStructure: number;
      houses: number;
      shifts: number;
      grading: number;
      departments: number;
    }
  ): {
    percentage: number;
    total: number;
    completed: number;
    missing: string[];
  } {
    const checks = [
      {
        key: "schoolProfile",
        label: "School Profile",
        condition: !!config?.school?.name && !!config?.school?.curriculumId,
      },
      {
        key: "academicYear",
        label: "Academic Year",
        condition: (counts.academicYear || 0) > 0,
      },
      {
        key: "classes",
        label: "Classes",
        condition: (counts.classes || 0) > 0,
      },
      {
        key: "sections",
        label: "Sections",
        condition: (counts.sections || 0) > 0,
      },
      {
        key: "subjects",
        label: "Subjects",
        condition: (config?.academic?.subjects?.length || 0) > 0,
      },
      {
        key: "teachers",
        label: "Teachers",
        condition: (counts.staff || 0) > 0,
      },
      {
        key: "staff",
        label: "Staff",
        condition: (counts.staff || 0) > 0,
      },
      {
        key: "students",
        label: "Students",
        condition: (counts.students || 0) > 0,
      },
      {
        key: "parents",
        label: "Parents",
        condition: (counts.parents || 0) > 0,
      },
      {
        key: "rooms",
        label: "Rooms",
        condition: (counts.rooms || 0) > 0,
      },
      {
        key: "buildings",
        label: "Buildings",
        condition: (counts.buildings || 0) > 0,
      },
      {
        key: "facilities",
        label: "Facilities",
        condition: (counts.facilities || 0) > 0,
      },
      {
        key: "library",
        label: "Library",
        condition: (counts.library || 0) > 0,
      },
      {
        key: "transport",
        label: "Transport",
        condition: (counts.transport || 0) > 0,
      },
      {
        key: "hostel",
        label: "Hostel",
        condition: (counts.hostel || 0) > 0,
      },
      {
        key: "feeStructure",
        label: "Fee Structure",
        condition: (counts.feeStructure || 0) > 0,
      },
      {
        key: "houses",
        label: "Houses",
        condition: (counts.houses || 0) > 0,
      },
      {
        key: "shifts",
        label: "Shifts",
        condition: (counts.shifts || 0) > 0,
      },
      {
        key: "grading",
        label: "Grading",
        condition: (counts.grading || 0) > 0,
      },
      {
        key: "departments",
        label: "Departments",
        condition: (counts.departments || 0) > 0,
      },
    ];
    const total = checks.length;
    const completed = checks.filter((c) => c.condition).length;
    const missing = checks.filter((c) => !c.condition).map((c) => c.label);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { percentage, total, completed, missing };
  }
}

export const configurationDashboardService = new ConfigurationDashboardService(
  new ConfigurationRepository(),
  new AcademicYearRepository(),
  new ClassRepository(),
  new SectionRepository(),
  new StudentRepository(),
  new StaffRepository(),
  new ParentsRepository()
);