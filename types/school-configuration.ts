// types/school-configuration.ts

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

// 🟢 LEGACY MODEL (Used by Mapper for reading old DB data)
export interface LegacySchoolConfiguration {
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

// 🟢 INPUT MODEL (Used by UI forms to send data to API)
export interface SchoolConfigurationInput {
  schoolName: string;
  schoolType: SchoolType;
  curriculumId: string;
  levels: string[];
  sectionNames?: string[];
  country?: string;
}
