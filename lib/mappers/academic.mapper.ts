// lib/mappers/academic.mapper.ts
import { MasterSchoolConfiguration } from "@/types/configuration";

export function mapAcademic(config: MasterSchoolConfiguration) {
  const classes = config.academic?.classes || [];
  const sections = config.academic?.sectionNames && config.academic.sectionNames.length > 0
    ? config.academic.sectionNames
    : ["A", "B", "C"];
  const subjects = config.academic?.subjects || [];
  
  return {
    levels: config.academic?.levels || [],
    classes: classes.map(c => {
      const classSecs = (c as any).sections && Array.isArray((c as any).sections) && (c as any).sections.length > 0
        ? (c as any).sections
        : sections;
      return {
        id: c.id || c.name,
        name: c.name,
        sections: classSecs,
      };
    }),
    sectionNames: sections,
    subjects: subjects,
    classCount: classes.length,
    subjectCount: subjects.length,
    sectionCount: sections.length,
    classSummary: `${classes.length} Classes`,
    
    // 🚀 FIX: Map requiredLabs and requiredTeachers from config
    requiredLabs: config.academic?.requiredLabs || [],
    requiredTeachers: config.academic?.requiredTeachers || {},
  };
}
