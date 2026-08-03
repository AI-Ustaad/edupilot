import { RoomRepository } from "@/repositories/room.repository";
import { BuildingRepository } from "@/repositories/building.repository";
import { FacilityRepository } from "@/repositories/facility.repository";
import { DepartmentRepository } from "@/repositories/department.repository";
import { LibraryRepository } from "@/repositories/library.repository";
import { TransportRepository } from "@/repositories/transport.repository";
import { HostelRepository } from "@/repositories/hostel.repository";
import { FeeStructureRepository } from "@/repositories/fee-structure.repository";
import { HouseRepository } from "@/repositories/house.repository";
import { ShiftRepository } from "@/repositories/shift.repository";
import { GradingRepository } from "@/repositories/grading.repository";

export class ConfigurationModulesService {
  readonly roomRepo: RoomRepository;
  readonly buildingRepo: BuildingRepository;
  readonly facilityRepo: FacilityRepository;
  readonly departmentRepo: DepartmentRepository;
  readonly libraryRepo: LibraryRepository;
  readonly transportRepo: TransportRepository;
  readonly hostelRepo: HostelRepository;
  readonly feeStructureRepo: FeeStructureRepository;
  readonly houseRepo: HouseRepository;
  readonly shiftRepo: ShiftRepository;
  readonly gradingRepo: GradingRepository;

  constructor() {
    this.roomRepo = new RoomRepository();
    this.buildingRepo = new BuildingRepository();
    this.facilityRepo = new FacilityRepository();
    this.departmentRepo = new DepartmentRepository();
    this.libraryRepo = new LibraryRepository();
    this.transportRepo = new TransportRepository();
    this.hostelRepo = new HostelRepository();
    this.feeStructureRepo = new FeeStructureRepository();
    this.houseRepo = new HouseRepository();
    this.shiftRepo = new ShiftRepository();
    this.gradingRepo = new GradingRepository();
  }
}

export const configurationModulesService = new ConfigurationModulesService();
