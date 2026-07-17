import { StateCreator } from "zustand";
import { EnterpriseRuntimeStore } from "../types";

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export interface AttendanceSlice {
  // O(1) Lookup: studentId -> AttendanceStats
  attendanceByStudentId: Record<string, AttendanceStats>;
  hydrateStudentAttendance: (studentId: string, stats: AttendanceStats) => void;
}

export const createAttendanceSlice: StateCreator<EnterpriseRuntimeStore, [], [], AttendanceSlice> = (set) => ({
  attendanceByStudentId: {},
  
  hydrateStudentAttendance: (studentId, stats) => 
    set((state) => ({
      attendanceByStudentId: {
        ...state.attendanceByStudentId,
        [studentId]: stats
      }
    }))
});
