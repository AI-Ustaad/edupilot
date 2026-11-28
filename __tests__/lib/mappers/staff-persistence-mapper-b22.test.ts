// B22 — staff name data quality: "ghzandar Ali" must be stored and
// displayed as "Ghzandar Ali" everywhere (single source: the staff mapper).
import { StaffPersistenceMapper } from "@/lib/mappers/StaffPersistenceMapper";

describe("B22 StaffPersistenceMapper name normalisation", () => {
  describe("fromDTO (write path)", () => {
    it("stores a lowercase name title-cased", () => {
      const entity = StaffPersistenceMapper.fromDTO({
        personal: { fullName: "ghzandar Ali" },
      } as any);
      expect(entity.personal?.fullName).toBe("Ghzandar Ali");
    });

    it("stores an all-caps name title-cased", () => {
      const entity = StaffPersistenceMapper.fromDTO({
        personal: { fullName: "AHMED SHAH" },
      } as any);
      expect(entity.personal?.fullName).toBe("Ahmed Shah");
    });

    it("leaves an already-correct name unchanged", () => {
      const entity = StaffPersistenceMapper.fromDTO({
        personal: { fullName: "Ghzandar Ali" },
      } as any);
      expect(entity.personal?.fullName).toBe("Ghzandar Ali");
    });
  });

  describe("fromFirestore (read path — legacy stored value)", () => {
    it("displays the legacy stored 'ghzandar Ali' as 'Ghzandar Ali'", () => {
      const entity = StaffPersistenceMapper.fromFirestore({
        id: "stf_01",
        fullName: "ghzandar Ali",
        employeeId: "STF-001",
        basicSalary: 50000,
        status: "active",
      } as any);
      expect(entity.fullName).toBe("Ghzandar Ali");
      expect(entity.name).toBe("Ghzandar Ali");
      expect(entity.personal?.fullName).toBe("Ghzandar Ali");
    });

    it("displays a flat lowercase name title-cased", () => {
      const entity = StaffPersistenceMapper.fromFirestore({
        id: "stf_09",
        fullName: "iqra qureshi",
        employeeId: "STF-009",
        basicSalary: 50000,
        status: "active",
      } as any);
      expect(entity.fullName).toBe("Iqra Qureshi");
    });

    it("still assigns STF-001 / PRS-01 to the legacy Ghzandar record", () => {
      const entity = StaffPersistenceMapper.fromFirestore({
        id: "stf_01",
        fullName: "ghzandar Ali",
        employeeId: "STF-001",
        basicSalary: 50000,
        status: "active",
      } as any);
      expect(entity.employeeId).toBe("STF-001");
      expect(entity.identity?.personnelNo).toBe("PRS-001");
    });
  });
});
