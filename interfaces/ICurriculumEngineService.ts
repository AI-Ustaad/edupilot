// interfaces/ICurriculumEngineService.ts
import type { AcademicLevel, Grade, Subject } from "@/types/curriculum";

export interface SchoolSelectionInput {
  countryId: string;
  systemId: string;
  authorityId: string;
  versionId: string;
  selectedLevelIds: string[];
}

export interface GeneratedAcademicStructure {
  levels: AcademicLevel[];
  grades: Grade[];
  allSubjects: Subject[];
  requiredLabs: string[];
  requiredTeachers: Record<string, number>;
}

export interface ICurriculumEngineService {
  generateAcademicStructure(input: SchoolSelectionInput): Promise<GeneratedAcademicStructure>;
}
