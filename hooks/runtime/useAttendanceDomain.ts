import { useRuntimeStore } from "@/lib/store/runtime.store";

export const useAttendanceDomain = () => {
  const attendanceByStudentId = useRuntimeStore((state) => state.attendanceByStudentId);

  // ⚡ O(1) Lookup: Get a single student's attendance instantly
  const getStudentAttendance = (studentId: string) => {
    // اگر ریکارڈ نہ ملے تو Default 0 ویلیوز بھیجیں
    return attendanceByStudentId[studentId] || {
      present: 0,
      absent: 0,
      late: 0,
      percentage: 0
    };
  };

  return {
    getStudentAttendance,
  };
};
