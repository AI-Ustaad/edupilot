// education/engines/education-rules.engine.ts
import { MASTER_CATALOG, ALL_SUBJECTS, EducationAuthority, EducationSystem, CurriculumVersion, AcademicLevel, Grade, Subject } from "@/education/catalog";
import { PAKISTAN_CATALOG, PAKISTAN_SUBJECTS } from "@/education/catalog/data/pakistan.catalog";

// Initialize Master Catalog (In future, this comes from Firestore)
const CATALOG = [PAKISTAN_CATALOG];
const SUBJECTS_DB = [...ALL_SUBJECTS, ...PAKISTAN_SUBJECTS];

export class EducationRulesEngine {

  // Rule 1: Get Countries
  getCountries() {
    return CATALOG.map(c => ({ id: c.id, name: c.name }));
  }

  // Rule 2: Get Provinces based on Country
  getProvinces(countryId: string) {
    const country = CATALOG.find(c => c.id === countryId);
    return country?.Provinces || [];
  }

  // Rule 3: Get Authorities based on Country and Ownership Type (Public/Private)
  getAuthorities(countryId: string, ownershipType?: string): EducationAuthority[] {
    const country = CATALOG.find(c => c.id === countryId);
    if (!country) return [];
    
    // @ts-ignore
    let authorities = country.authorities || [];
    if (ownershipType) {
      authorities = authorities.filter(a => a.ownershipType === ownershipType);
    }
    return authorities;
  }

  // Rule 4: Get Systems (Curriculums) for an Authority
  getSystems(authorityId: string): EducationSystem[] {
    for (const country of CATALOG) {
      // @ts-ignore
      const auth = country.authorities?.find(a => a.id === authorityId);
      if (auth) return auth.systems;
    }
    return [];
  }

  // Rule 5: Get Curriculum Versions for a System
  getVersions(systemId: string): CurriculumVersion[] {
    for (const country of CATALOG) {
      // @ts-ignore
      for (const auth of country.authorities || []) {
        const sys = auth.systems.find(s => s.id === systemId);
        if (sys) return sys.versions;
      }
    }
    return [];
  }

  // Rule 6: Get Levels for specific Versions
  getLevels(versionId: string): AcademicLevel[] {
    for (const country of CATALOG) {
      // @ts-ignore
      for (const auth of country.authorities || []) {
        for (const sys of auth.systems) {
          const ver = sys.versions.find(v => v.id === versionId);
          if (ver) return ver.levels;
        }
      }
    }
    return [];
  }

  // Rule 7: The Master Intelligence Rule - Generate Academic Structure
  generateAcademicStructure(versionId: string, selectedLevelIds: string[]) {
    let selectedLevels: AcademicLevel[] = [];
    let selectedGrades: Grade[] = [];

    // 1. Fetch Selected Levels and Grades
    const allLevels = this.getLevels(versionId);
    selectedLevels = allLevels.filter(l => selectedLevelIds.includes(l.id));
    selectedGrades = selectedLevels.flatMap(l => l.grades);

    // 2. Extract Unique Subjects and Build Scheme
    const uniqueSubjectIds = new Set<string>();
    selectedGrades.forEach(grade => {
      grade.schemeOfStudy.subjects.forEach(subMap => {
        uniqueSubjectIds.add(subMap.subjectId);
      });
    });

    const allSubjects: Subject[] = [];
    const requiredLabs: string[] = [];
    const requiredTeachers: Record<string, number> = {};
    const departments: Set<string> = new Set();

    uniqueSubjectIds.forEach(id => {
      const subject = SUBJECTS_DB.find(s => s.id === id);
      if (subject) {
        allSubjects.push(subject);
        departments.add(subject.department);
        
        if (subject.requiresLab && !requiredLabs.includes(`${subject.name} Lab`)) {
          requiredLabs.push(`${subject.name} Lab`);
        }
        
        requiredTeachers[subject.name] = selectedLevels.length; // 1 Teacher per subject per level
      }
    });

    return {
      levels: selectedLevels,
      grades: selectedGrades,
      allSubjects,
      requiredLabs,
      requiredTeachers,
      departments: Array.from(departments)
    };
  }
}

export const educationRulesEngine = new EducationRulesEngine();
