// lib/mappers/academic.mapper.ts
import { MasterSchoolConfiguration } from "@/types/configuration";

export function mapAcademic(config: MasterSchoolConfiguration) {
  const classes = config.academic?.classes || [];
  const sections = config.academic?.sectionNames || [];
  const subjects = config.academic?.subjects || [];
  
  return {
    levels: config.academic?.levels || [],
    classes: classes.map(c => ({ name: c.name, subjects: c.subjects || [] })),
    sectionNames: sections, // 🚀 FIX: Ensuring sectionNames is passed to ViewModel
    subjects: subjects,
    classCount: classes.length,
    subjectCount: subjects.length,
    sectionCount: sections.length,
    classSummary: `${classes.length} Classes`,
  };
}
