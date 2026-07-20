// education/catalog/index.ts
import { Country } from "./types.catalog";
import { PAKISTAN_SUBJECTS } from "./data/pakistan.catalog";
import { GULF_SUBJECTS } from "./data/gulf.catalog";

// Combine all subjects
export const ALL_SUBJECTS = [...PAKISTAN_SUBJECTS, ...GULF_SUBJECTS];

// This is where we would build the massive nested tree.
// For execution, we'll populate this with the full Authorities -> Systems -> Levels -> Grades tree.
export const MASTER_CATALOG: Country[] = [
  // PAKISTAN object with nested Authorities, Systems, Curriculum Versions, Levels, and Grades would go here.
  // UAE object would go here.
];

export * from "./types.catalog";
