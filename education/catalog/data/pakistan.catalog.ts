// education/catalog/data/pakistan.catalog.ts
import { Country, Subject } from "../types.catalog";

// 1. Define Core Subjects for Pakistan
export const PAKISTAN_SUBJECTS: Subject[] = [
  { id: "eng", name: "English", code: "ENG", department: "Languages", requiresLab: false },
  { id: "urd", name: "Urdu", code: "URD", department: "Languages", requiresLab: false },
  { id: "math", name: "Mathematics", code: "MTH", department: "Sciences", requiresLab: false },
  { id: "sci", name: "General Science", code: "SCI", department: "Sciences", requiresLab: true },
  { id: "phy", name: "Physics", code: "PHY", department: "Sciences", requiresLab: true },
  { id: "chem", name: "Chemistry", code: "CHM", department: "Sciences", requiresLab: true },
  { id: "bio", name: "Biology", code: "BIO", department: "Sciences", requiresLab: true },
  { id: "cs", name: "Computer Science", code: "CS", department: "Computer Science", requiresLab: true },
  { id: "isl", name: "Islamiyat", code: "ISL", department: "Religious", requiresLab: false },
  { id: "pst", name: "Pakistan Studies", code: "PST", department: "Humanities", requiresLab: false },
  { id: "ss", name: "Social Studies", code: "SST", department: "Humanities", requiresLab: false },
  { id: "quran", name: "Nazra Quran", code: "QUR", department: "Religious", requiresLab: false },
];

// 2. Build Pakistan Country with Authorities, Systems, Versions, Levels, Grades, and Schemes
export const PAKISTAN_CATALOG: Country = {
  id: "pk",
  name: "Pakistan",
  code: "PK",
  Provinces: [
    { id: "punjab", name: "Punjab", countryId: "pk" },
    { id: "sindh", name: "Sindh", countryId: "pk" },
    { id: "kpk", name: "Khyber Pakhtunkhwa", countryId: "pk" },
    { id: "balochistan", name: "Balochistan", countryId: "pk" },
  ],
  // Note: In a real DB, this would be relational. Here we nest for easy tree traversal.
};

// For simplicity in this phase, we define a massive nested object.
// We'll attach it to the country object directly in the catalog index.
