export type SchoolType = "Private" | "Government" | "Madrissa";

export interface ConfiguredSubject {
  name: string;
  type: "Compulsory" | "Optional" | "Practical";
}

export interface ConfiguredClass {
  name: string;
  level: string;
  subjects: ConfiguredSubject[];
}

export interface SchoolConfiguration {
  schemaVersion: 1;
  status: "draft" | "configured";
  school: {
    name: string;
    type: SchoolType;
    boardId: string;
    boardName: string;
    curriculumId: string;
    country?: string;
  };
  academicStructure: {
    levels: string[];
    classes: ConfiguredClass[];
    sectionNames: string[];
    subjects: string[];
  };
  currentAcademicYearId?: string;
  completedAt?: string;
  completedBy?: string;
  version: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LegacySchoolConfiguration {
  schoolName: string;
  schoolType: SchoolType;
  curriculumId: string;
  levels: string[];
  sectionNames?: string[];
  country?: string;
}
