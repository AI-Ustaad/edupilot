// lib/mappers/academic.mapper.ts
import { MasterSchoolConfiguration } from "@/types/configuration";

export function mapAcademic(config: MasterSchoolConfiguration) {
  const classes = config.academic?.classes || [];
  const sections = config.academic?.sectionNames || [];
  const subjects = config.academic?.subjects || [];
  
  return {
    levels: config.academic?.levels || [],
    classes: classes.map(c => ({ id: c.id || c.name, name: c.name })),
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
