// types/configuration/domains.ts

export interface SchoolProfile {
  name: string;
  type: "Private" | "Government" | "Madrissa";
  curriculumId: string;
  boardName: string;
  country: string;
  logoUrl?: string;
}

export interface AcademicClass {
  id: string;
  name: string;
  level: string;
  subjects: string[];
}

export interface AcademicStructure {
  levels: string[];
  classes: AcademicClass[];
  sectionNames: string[];
  subjects: string[];
}
