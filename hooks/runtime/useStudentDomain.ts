import { useRuntimeStore } from "@/lib/store/runtime.store";

/**
 * 🎓 Enterprise Rule 11 & 12 Enforced
 * UI Components will ONLY use this SDK to interact with Student Data.
 */
export const useStudentDomain = () => {
  // 1. Get raw normalized maps from Kernel
  const studentsById = useRuntimeStore((state) => state.studentsById);
  const studentsByClass = useRuntimeStore((state) => state.studentsByClass);
  const studentsBySection = useRuntimeStore((state) => state.studentsBySection);
  const selectedStudentId = useRuntimeStore((state) => state.selectedStudentId);

  // 2. Actions
  const selectStudent = useRuntimeStore((state) => state.selectStudent);

  // ⚡ O(1) Lookup: Get a single student instantly
  const getStudent = (studentId: string) => {
    return studentsById[studentId] || null;
  };

  // ⚡ O(1) Lookup: Get all students for a specific class instantly
  const getStudentsByClass = (classId: string) => {
    const ids = studentsByClass[classId] || [];
    return ids.map(id => studentsById[id]).filter(Boolean);
  };

  // ⚡ O(1) Lookup: Get all students for a specific section instantly
  const getStudentsBySection = (sectionId: string) => {
    const ids = studentsBySection[sectionId] || [];
    return ids.map(id => studentsById[id]).filter(Boolean);
  };

  // 🟢 NEW: Convenience method to get all students as an array
  const getAllStudents = () => {
    return Object.values(studentsById);
  };

  // 🎯 Get the currently selected student (for Student 360 View)
  const selectedStudent = selectedStudentId ? studentsById[selectedStudentId] : null;

  return {
    studentsById, // 🟢 FIXED: Exporting the raw map so the UI can use it
    getAllStudents,
    getStudent,
    getStudentsByClass,
    getStudentsBySection,
    selectedStudent,
    selectStudent,
    totalStudentsLoaded: Object.keys(studentsById).length,
  };
};
