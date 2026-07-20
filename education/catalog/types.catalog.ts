// education/catalog/types.catalog.ts

export type SchoolOwnershipType = "Public" | "Private" | "Public-Private Partnership";
export type EducationSystemType = "National" | "International" | "Technical" | "Religious";

// 🚀 NEW: Institution Types
export type InstitutionType = 
  | "School" 
  | "Madrassah" 
  | "College" 
  | "University" 
  | "Technical Institute" 
  | "Vocational Institute" 
  | "Online Institute";

// 🚀 NEW: Madrassah Categories
export type MadrassahCategory = 
  | "Hifz-ul-Quran" 
  | "Nazra Quran" 
  | "Dars-e-Nizami" 
  | "Jamia" 
  | "Integrated School + Madrassah" 
  | "Custom";

export type SubjectCategory = "Core" | "Elective" | "Optional" | "Compulsory";
export type DepartmentType = "Sciences" | "Humanities" | "Commerce" | "Languages" | "Arts" | "Religious" | "Computer Science" | "Physical Education";

export interface Country {
  id: string;
  name: string;
  code: string; // e.g., "PK", "AE"
  Provinces: Province[];
}

export interface Province {
  id: string;
  name: string;
  countryId: string;
}

export interface EducationAuthority {
  id: string;
  name: string; // e.g., "Punjab Government", "Federal Board (FBISE)"
  countryId: string;
  provinceId?: string;
  ownershipType: SchoolOwnershipType;
  institutionType: InstitutionType; // 🚀 NEW
  madrassahCategory?: MadrassahCategory; // 🚀 NEW
  systems: EducationSystem[];
}

export interface EducationSystem {
  id: string; // e.g., "pctb_snc", "cambridge_cie"
  name: string; // e.g., "Single National Curriculum (SNC)", "Cambridge Assessment International Education"
  type: EducationSystemType;
  versions: CurriculumVersion[];
}

export interface CurriculumVersion {
  id: string; // e.g., "snc_2024", "cambridge_2023"
  name: string;
  year: string;
  levels: AcademicLevel[];
}

export interface AcademicLevel {
  id: string; // e.g., "primary", "secondary", "igcse"
  name: string; // e.g., "Primary", "Secondary", "IGCSE"
  grades: Grade[];
}

export interface Grade {
  id: string; // e.g., "grade_1", "year_10"
  name: string; // e.g., "Grade 1", "Year 10"
  order: number;
  ageRule?: string;
  schemeOfStudy: SchemeOfStudy;
  levelId?: string; // Added for mapping
}

export interface SchemeOfStudy {
  subjects: SubjectMapping[];
}

export interface SubjectMapping {
  subjectId: string;
  category: SubjectCategory;
  defaultPeriods: number;
}

export interface Subject {
  id: string; // e.g., "eng_101", "phy_201"
  name: string;
  code: string;
  department: DepartmentType;
  requiresLab: boolean;
}

export interface PromotionRule {
  minPassingPercentage: number;
  failInSubjectsAllowed: number;
}
