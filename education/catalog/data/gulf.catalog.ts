// education/catalog/data/gulf.catalog.ts
import { Country, Subject } from "../types.catalog";

export const GULF_SUBJECTS: Subject[] = [
  { id: "arabic", name: "Arabic Language", code: "ARA", department: "Languages", requiresLab: false },
  { id: "isl_studies", name: "Islamic Studies", code: "ISL", department: "Religious", requiresLab: false },
  { id: "moral_ed", name: "Moral Education", code: "ME", department: "Humanities", requiresLab: false },
  { id: "social_studies", name: "Social Studies", code: "SST", department: "Humanities", requiresLab: false },
];

export const UAE_CATALOG: Country = {
  id: "ae",
  name: "United Arab Emirates",
  code: "AE",
  Provinces: [
    { id: "dubai", name: "Dubai", countryId: "ae" },
    { id: "abu_dhabi", name: "Abu Dhabi", countryId: "ae" },
  ],
};
