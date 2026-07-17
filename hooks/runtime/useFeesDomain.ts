import { useRuntimeStore } from "@/lib/store/runtime.store";

export const useFeesDomain = () => {
  const feesByStudentId = useRuntimeStore((state) => state.feesByStudentId);

  // ⚡ O(1) Lookup: Get a single student's fees instantly
  const getStudentFees = (studentId: string) => {
    // اگر ریکارڈ نہ ملے تو Default 0 ویلیوز بھیجیں
    return feesByStudentId[studentId] || {
      totalDue: 0,
      totalPaid: 0,
      outstanding: 0,
      records: []
    };
  };

  return {
    getStudentFees,
  };
};
