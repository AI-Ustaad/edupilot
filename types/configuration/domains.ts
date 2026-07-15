export interface SchoolProfile {
  name: string;
  type: "Private" | "Government" | "Madrissa";
  curriculumId: string;
  country: string;
  logoUrl?: string;
}

export interface AcademicClass {
  id: string;
  name: string;
  level: string;
}

export interface SubjectConfig {
  name: string;
  type: "Compulsory" | "Optional" | "Practical";
}

export interface AcademicStructure {
  levels: string[];
  classes: AcademicClass[];
  subjects: SubjectConfig[];
  defaultSections: string[];
}
