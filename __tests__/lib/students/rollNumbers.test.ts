import { findSmallestMissingRollNumber } from "@/lib/students/rollNumbers";

describe("findSmallestMissingRollNumber (B23)", () => {
  test("returns 1 when no roll numbers are in use", () => {
    expect(findSmallestMissingRollNumber([])).toBe(1);
  });

  test("returns max+1 when the sequence is complete", () => {
    expect(findSmallestMissingRollNumber([1, 2, 3])).toBe(4);
    expect(findSmallestMissingRollNumber(["1", "2", "3"])).toBe(4);
  });

  test("returns the gap — the audit case: rolls 1-44 and 46 give 45", () => {
    const used = [...Array.from({ length: 44 }, (_, i) => i + 1), 46, 103];
    expect(findSmallestMissingRollNumber(used)).toBe(45);
  });

  test("returns 1 when the sequence starts at 2", () => {
    expect(findSmallestMissingRollNumber([2, 3, 4])).toBe(1);
  });

  test("returns the first gap, not the last", () => {
    expect(findSmallestMissingRollNumber([1, 3, 5, 7])).toBe(2);
  });

  test("ignores non-numeric, zero, negative and blank rolls", () => {
    expect(findSmallestMissingRollNumber([1, 2, "A-1", 0, -5, "", null, undefined])).toBe(3);
  });

  test("ignores duplicates", () => {
    expect(findSmallestMissingRollNumber([1, 1, 2, 2, 4])).toBe(3);
  });

  test("numeric strings count as their number", () => {
    expect(findSmallestMissingRollNumber(["1", "2", "4"])).toBe(3);
  });
});
