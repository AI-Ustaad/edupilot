// services/configuration.domain.service.ts

import { CURRICULUMS } from "@/lib/curriculum-data";
import { MasterSchoolConfiguration, ConfigurationState, FeatureRegistry, AcademicStructure } from "@/types/configuration";
import { SchoolConfigurationInput } from "@/types/school-configuration";

export class ConfigurationDomainService {
  
  validateBusinessRules(input: SchoolConfigurationInput): void {
    const curriculum = CURRICULUMS.find((item) => item.id === input.curriculumId);
    if (!curriculum) throw new Error("Selected education board is not supported");

    if (input.schoolType === "Government" && !["federal", "punjab"].includes(curriculum.id)) {
      throw new Error("Government schools must use a supported government board");
    }
    if (input.schoolType === "Madrissa" && curriculum.id !== "wifaq") {
      throw new Error("Madrissa schools must use the Wifaq curriculum");
    }
  }

  buildAcademicStructure(input: SchoolConfigurationInput): AcademicStructure {
    const curriculum = CURRICULUMS.find((item) => item.id === input.curriculumId)!;
    const levels = [...new Set(input.levels)];
    
    const classes = levels.flatMap((level) => 
      (curriculum.levels[level as keyof typeof curriculum.levels] || []).map((item) => ({
        id: `cls_${level}_${item.name}`.toLowerCase(),
        name: item.name,
        level: level,
        subjects: item.subjects.map((s: any) => s.name)
      }))
    );

    if (!classes.length) throw new Error("The selected board does not define classes for the selected levels");

    const sectionNames = input.sectionNames?.length ? input.sectionNames : ["A"];
    const subjects = [...new Set(classes.flatMap(c => c.subjects))];

    return { levels, classes, sectionNames, subjects };
  }

  getDefaultFeatures(): FeatureRegistry {
    return {
      ai: {
        enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false,
        providers: ["gemini"], activeProvider: "gemini", quota: 1000
      },
      library: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
      transport: { enabled: false, version: "1.0", permissions: ["admin"], beta: false },
      fees: { enabled: true, version: "1.0", permissions: ["admin", "accountant"], beta: false },
      attendance: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
      exams: { enabled: true, version: "1.0", permissions: ["admin", "teacher"], beta: false },
    };
  }

  transitionState(currentState: ConfigurationState, targetState: ConfigurationState): void {
    // State Machine Logic (Draft -> Validated -> Published -> Locked -> Archived)
    if (currentState === "Locked" && targetState !== "Archived") {
      throw new Error("Locked configuration can only be archived.");
    }
  }
}
