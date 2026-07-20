// education/catalog/index.ts
import { Country } from "./types.catalog";
import { PAKISTAN_SUBJECTS, PAKISTAN_CATALOG } from "./data/pakistan.catalog";
import { GULF_SUBJECTS, UAE_CATALOG } from "./data/gulf.catalog";

// Combine all subjects
export const ALL_SUBJECTS = [...PAKISTAN_SUBJECTS, ...GULF_SUBJECTS];

// Aggregate all countries into Master Catalog
export const MASTER_CATALOG: Country[] = [
  PAKISTAN_CATALOG,
  UAE_CATALOG
];

export * from "./types.catalog";
