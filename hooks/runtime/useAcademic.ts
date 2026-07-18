import { useRuntimeStore } from "@/lib/store/runtime.store";

export const useAcademic = () => {
  const levels = useRuntimeStore((state) => state.levels);
  const classes = useRuntimeStore((state) => state.classes);
  const subjects = useRuntimeStore((state) => state.subjects);
  const defaultSections = useRuntimeStore((state) => state.defaultSections);

  // Helper Methods
  const getClassesByLevel = (level: string) => classes.filter(c => c.level === level);
  
  // 🟢 FIX: Directly check the string array using .includes()
  const isSubjectAvailable = (subjectName: string) => subjects.includes(subjectName);

  return {
    levels,
    classes,
    subjects,
    defaultSections,
    getClassesByLevel,
    isSubjectAvailable,
  };
};
