// services/curriculum-engine.service.ts
import { CurriculumRepository } from "@/repositories/curriculum.repository";
import { AcademicLevel, Subject, Grade } from "@/types/curriculum";

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
  requiredTeachers: Record<string, number>; // Subject Name -> Count
}

export class CurriculumEngineService {
  constructor(private readonly repo = new CurriculumRepository()) {}

  async generateAcademicStructure(input: SchoolSelectionInput): Promise<GeneratedAcademicStructure> {
    const version = await this.repo.getCurriculumVersion(
      input.countryId,
      input.systemId,
      input.authorityId,
      input.versionId
    );

    if (!version) {
      throw new Error("Curriculum Version not found in Master Catalog.");
    }

    // 1. Filter only selected levels (e.g., Primary, Secondary)
    const selectedLevels = version.levels.filter(level => 
      input.selectedLevelIds.includes(level.id)
    );

    // 2. Extract all grades from selected levels
    const grades = selectedLevels.flatMap(level => level.grades);

    // 3. Extract all unique subjects across all grades and groups
    const subjectMap = new Map<string, Subject>();
    grades.forEach(grade => {
      grade.subjectGroups.forEach(group => {
        group.subjects.forEach(subject => {
          if (!subjectMap.has(subject.id)) {
            subjectMap.set(subject.id, subject);
          }
        });
      });
    });
    const allSubjects = Array.from(subjectMap.values());

    // 4. Calculate Required Labs (Intelligence Rule)
    const requiredLabs = Array.from(new Set(
      allSubjects.filter(s => s.requiresLab).map(s => `${s.name} Lab`)
    ));

    // 5. Calculate Required Teachers (Intelligence Rule: 1 Teacher per Subject per Grade Level)
    const requiredTeachers: Record<string, number> = {};
    allSubjects.forEach(subject => {
      requiredTeachers[subject.name] = selectedLevels.length; // Simplified logic
    });

    return {
      levels: selectedLevels,
      grades,
      allSubjects,
      requiredLabs,
      requiredTeachers
    };
  }
}

export const curriculumEngine = new CurriculumEngineService();
