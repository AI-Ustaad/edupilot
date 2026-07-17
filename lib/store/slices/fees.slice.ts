import { StateCreator } from "zustand";
import { EnterpriseRuntimeStore } from "../types";

export interface FeeStats {
  totalDue: number;
  totalPaid: number;
  outstanding: number;
  records: any[]; // We will type this properly later
}

export interface FeesSlice {
  // O(1) Lookup: studentId -> FeeStats
  feesByStudentId: Record<string, FeeStats>;
  hydrateStudentFees: (studentId: string, stats: FeeStats) => void;
}

export const createFeesSlice: StateCreator<EnterpriseRuntimeStore, [], [], FeesSlice> = (set) => ({
  feesByStudentId: {},
  
  hydrateStudentFees: (studentId, stats) => 
    set((state) => ({
      feesByStudentId: {
        ...state.feesByStudentId,
        [studentId]: stats
      }
    }))
});
