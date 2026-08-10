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
import { DepartmentRepository } from "@/repositories/department.repository";
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
    private readonly parentRepo: ParentsRepository,
    private readonly roomRepo: RoomRepository,
    private readonly buildingRepo: BuildingRepository,
    private readonly facilityRepo: FacilityRepository,
    private readonly libraryRepo: LibraryRepository,
    private readonly transportRepo: TransportRepository,
    private readonly hostelRepo: HostelRepository,
    private readonly feeStructureRepo: FeeStructureRepository,
    private readonly houseRepo: HouseRepository,
    private readonly shiftRepo: ShiftRepository,
    private readonly gradingRepo: GradingRepository,
    private readonly departmentRepo: DepartmentRepository
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
      rooms,
      buildings,
      facilities,
      library,
      transport,
      hostel,
      feeStructure,
      houses,
      shifts,
      grading,
      departments,
    ] = await Promise.all([
      this.academicYearRepo.findAllByTenant(tenantId).catch(() => []),
      this.classRepo.getAll(tenantId).catch(() => []),
      this.sectionRepo.findAllActive(tenantId).catch(() => []),
      this.studentRepo.count(tenantId).catch(() => 0),
      this.staffRepo.findAll(tenantId).catch(() => []),
      this.parentRepo.findAll(tenantId).catch(() => []),
      this.roomRepo.getAll(tenantId).catch(() => []),
      this.buildingRepo.getAll(tenantId).catch(() => []),
      this.facilityRepo.getAll(tenantId).catch(() => []),
      this.libraryRepo.getAll(tenantId).catch(() => []),
      this.transportRepo.getAll(tenantId).catch(() => []),
      this.hostelRepo.getAll(tenantId).catch(() => []),
      this.feeStructureRepo.getFeeStructures(tenantId).catch(() => []),
      this.houseRepo.getAll(tenantId).catch(() => []),
      this.shiftRepo.getAll(tenantId).catch(() => []),
      this.gradingRepo.getAll(tenantId).catch(() => []),
      this.departmentRepo.getAll(tenantId).catch(() => []),
    ]);

    return {
      academicYear: academicYear.length,
      classes: Array.isArray(classes) ? classes.length : 0,
      sections: Array.isArray(sections) ? sections.length : 0,
      students,
      staff: Array.isArray(staffList) ? staffList.length : 0,
      parents: Array.isArray(parentsList) ? parentsList.length : 0,
      rooms: Array.isArray(rooms) ? rooms.length : 0,
      buildings: Array.isArray(buildings) ? buildings.length : 0,
      facilities: Array.isArray(facilities) ? facilities.length : 0,
      library: Array.isArray(library) ? library.length : 0,
      transport: Array.isArray(transport) ? transport.length : 0,
      hostel: Array.isArray(hostel) ? hostel.length : 0,
      feeStructure: Array.isArray(feeStructure) ? feeStructure.length : 0,
      houses: Array.isArray(houses) ? houses.length : 0,
      shifts: Array.isArray(shifts) ? shifts.length : 0,
      grading: Array.isArray(grading) ? grading.length : 0,
      departments: Array.isArray(departments) ? departments.length : 0,
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