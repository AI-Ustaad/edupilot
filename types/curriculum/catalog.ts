// types/curriculum/catalog.ts
import { AcademicLevel } from "./academic";

export type EducationSystemType = ...
export type EducationSystemType = 
  | "National" 
  | "International" 
  | "Technical" 
  | "Religious" 
  | "Custom";

export interface CountryEducationSystem {
  id: string; // e.g., "pak", "ind", "usa", "uae"
  name: string; // e.g., "Pakistan", "India"
  code: string; // e.g., "PK", "IN"
  systems: EducationSystem[];
}

export interface EducationSystem {
  id: string; // e.g., "pctb_snc", "fbise", "cambridge"
  name: string; // e.g., "Punjab Curriculum & Textbook Board (PCTB / SNC)"
  type: EducationSystemType;
  countryId: string;
  authorities: EducationAuthority[]; // Boards
}

export interface EducationAuthority {
  id: string; // e.g., "bise_lahore", "federal_board"
  name: string; // e.g., "BISE Lahore", "Federal Board of Intermediate and Secondary Education"
  systemId: string;
  curriculumVersions: CurriculumVersion[];
}

export interface CurriculumVersion {
  id: string; // e.g., "snc_2024", "cambridge_2023"
  name: string; // e.g., "SNC 2024", "Cambridge International"
  year: string; // e.g., "2024"
  levels: AcademicLevel[];
}
