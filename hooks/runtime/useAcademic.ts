import { useRuntimeStore } from "@/lib/store/runtime.store";

/**
 * 🎓 Rule 12: Runtime First - UI will only talk to this SDK.
 */
export const useAcademic = () => {
  const classes = useRuntimeStore((state) => state.classes);
  const subjects = useRuntimeStore((state) => state.subjects);
  const levels = useRuntimeStore((state) => state.levels);
  const defaultSections = useRuntimeStore((state) => state.defaultSections);

  // Helper Methods
  const getClassesByLevel = (level: string) => classes.filter(c => c.level === level);
  const isSubjectAvailable = (subjectName: string) => subjects.some(s => s.name === subjectName);

  return {
    classes,
    subjects,
    levels,
    defaultSections,
    getClassesByLevel,
    isSubjectAvailable
  };
};
