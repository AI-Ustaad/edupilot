import { StateCreator } from "zustand";
import { StudentEntity } from "@/entities/student.entity";
import { EnterpriseRuntimeStore } from "../types";

// 🟢 The Normalized State Interface
export interface StudentSlice {
  // 1. The Core Data Dictionary (Single Source of Truth)
  studentsById: Record<string, StudentEntity>;

  // 2. O(1) Smart Indexes (Pointers to studentIds)
  studentsByClass: Record<string, string[]>; // e.g., { "class-5": ["std-1", "std-2"] }
  studentsBySection: Record<string, string[]>;
  studentsByAdmissionNumber: Record<string, string>; // Value is a single studentId
  studentsByParent: Record<string, string[]>;
  
  // 3. Runtime Context
  selectedStudentId: string | null;
  syncStatus: "idle" | "syncing" | "error";
  lastSyncAt: string | null;

  // 4. Engine Actions
  hydrateStudents: (students: StudentEntity[]) => void;
  selectStudent: (studentId: string | null) => void;
  updateStudentStatus: (studentId: string, status: StudentEntity["status"]) => void;
}

export const createStudentSlice: StateCreator<EnterpriseRuntimeStore, [], [], StudentSlice> = (set) => ({
  studentsById: {},
  studentsByClass: {},
  studentsBySection: {},
  studentsByAdmissionNumber: {},
  studentsByParent: {},
  
  selectedStudentId: null,
  syncStatus: "idle",
  lastSyncAt: null,

  // 🚀 The Synchronization Engine: Normalizes Raw Data into O(1) Indexes
  hydrateStudents: (students: StudentEntity[]) => {
    set((state) => {
      const newById: Record<string, StudentEntity> = {};
      const newByClass: Record<string, string[]> = {};
      const newBySection: Record<string, string[]> = {};
      const newByAdmissionNumber: Record<string, string> = {};
      const newByParent: Record<string, string[]> = {};

      students.forEach((student) => {
        const id = student.studentId;
        
        // Populate Core Dictionary
        newById[id] = student;

        // Build Class Index
        const classId = student.academic.classId;
        if (!newByClass[classId]) newByClass[classId] = [];
        newByClass[classId].push(id);

        // Build Section Index
        const sectionId = student.academic.sectionId;
        if (!newBySection[sectionId]) newBySection[sectionId] = [];
        newBySection[sectionId].push(id);

        // Build Admission Number Index
        newByAdmissionNumber[student.identity.admissionNumber] = id;

        // Build Parent Index
               const parentId = student.parentReferences.primaryParentId || "unassigned";
        if (!newByParent[parentId]) newByParent[parentId] = [];
        newByParent[parentId].push(id);
      });

      return {
        ...state,
        studentsById: newById,
        studentsByClass: newByClass,
        studentsBySection: newBySection,
        studentsByAdmissionNumber: newByAdmissionNumber,
        studentsByParent: newByParent,
        syncStatus: "idle",
        lastSyncAt: new Date().toISOString()
      };
    });
  },

  selectStudent: (studentId) => set({ selectedStudentId: studentId }),

  updateStudentStatus: (studentId, status) => 
    set((state) => {
      const student = state.studentsById[studentId];
      if (!student) return state; // Do nothing if student not found

      return {
        studentsById: {
          ...state.studentsById,
          [studentId]: { ...student, status } // Immutable Update
        }
      };
    })
});
