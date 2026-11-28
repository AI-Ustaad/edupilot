import { normalizeNaturalKey, sectionNaturalKey, sectionDocId, departmentNaturalKey, normalizePersonName } from "@/lib/utils/normalization";

describe("normalization", () => {
  describe("normalizeNaturalKey", () => {
    test("trims whitespace", () => {
      expect(normalizeNaturalKey(" A ")).toBe("a");
      expect(normalizeNaturalKey("\tGrade 1\n")).toBe("grade 1");
    });

    test("lowercases", () => {
      expect(normalizeNaturalKey("A")).toBe("a");
      expect(normalizeNaturalKey("COMPUTER SCIENCE")).toBe("computer science");
    });

    test("resolves A, A ,  A, a consistently", () => {
      const variants = ["A", "A ", " A", "a", " A ", "a", "A"];
      const set = new Set(variants.map(normalizeNaturalKey));
      expect(set.size).toBe(1);
      expect(set.has("a")).toBe(true);
    });

    test("resolves empty and nullish inputs to empty string", () => {
      expect(normalizeNaturalKey("")).toBe("");
      expect(normalizeNaturalKey("   ")).toBe("");
      expect(normalizeNaturalKey(null as any)).toBe("");
      expect(normalizeNaturalKey(undefined as any)).toBe("");
    });
  });

  describe("sectionNaturalKey", () => {
    test("is stable across whitespace and case variants", () => {
      expect(sectionNaturalKey("t", "Grade 1", "A")).toBe(sectionNaturalKey("t", " grade 1 ", "a"));
    });

    test("includes tenant, classGrade and sectionName", () => {
      expect(sectionNaturalKey("tenant-1", "10", "A")).toBe("tenant-1::10::a");
    });
  });

  describe("sectionDocId", () => {
    test("produces deterministic lowercased id", () => {
      expect(sectionDocId("Tenant-1", "Grade 1", "A")).toBe("tenant-1__grade 1__a");
    });
  });

  describe("departmentNaturalKey", () => {
    test("Computer Science, computer science , COMPUTER SCIENCE collide", () => {
      const k = departmentNaturalKey("t", "Computer Science");
      expect(departmentNaturalKey("t", " computer science ")).toBe(k);
      expect(departmentNaturalKey("t", "COMPUTER SCIENCE")).toBe(k);
    });
  });

  describe("normalizePersonName (B22)", () => {
    test("title-cases the audit case: 'ghzandar Ali' -> 'Ghzandar Ali'", () => {
      expect(normalizePersonName("ghzandar Ali")).toBe("Ghzandar Ali");
      expect(normalizePersonName("GHZANDAR ALI")).toBe("Ghzandar Ali");
    });

    test("trims and collapses internal whitespace", () => {
      expect(normalizePersonName("  ahmed   shah  ")).toBe("Ahmed Shah");
      expect(normalizePersonName("muhammad\t ali\n")).toBe("Muhammad Ali");
    });

    test("capitalises after hyphens and apostrophes", () => {
      expect(normalizePersonName("abdul-rehman khan")).toBe("Abdul-Rehman Khan");
      expect(normalizePersonName("o'brien")).toBe("O'Brien");
    });

    test("leaves intentionally mixed-case words untouched (Ph.D, McDonald)", () => {
      expect(normalizePersonName("Dr. Sarah Jenkins Ph.D")).toBe("Dr. Sarah Jenkins Ph.D");
      expect(normalizePersonName("john McDonald")).toBe("John McDonald");
    });

    test("leaves already-correct names unchanged", () => {
      expect(normalizePersonName("Ghzandar Ali")).toBe("Ghzandar Ali");
      expect(normalizePersonName("Imran Haider Sandhu")).toBe("Imran Haider Sandhu");
    });

    test("resolves empty and nullish inputs to empty string", () => {
      expect(normalizePersonName("")).toBe("");
      expect(normalizePersonName("   ")).toBe("");
      expect(normalizePersonName(null as any)).toBe("");
      expect(normalizePersonName(undefined as any)).toBe("");
    });
  });
});
