// 🟢 Enterprise Rule 15: Immutable Domain Identity
// This is the core Domain Model. Everything revolves around studentId.

export type StudentStatus = "Active" | "Suspended" | "Graduated" | "StruckOff" | "OnLeave";

export interface StudentEntity {
  studentId: string; // The Immutable Identifier
  
  identity: {
    admissionNumber: string; // Can change in rare cases
    rollNumber?: string;     // Changes yearly
    rfid?: string;
    cnicOrBForm?: string;
  };

  personal: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: "Male" | "Female" | "Other";
    avatarUrl?: string;
  };

  academic: {
    campusId: string;
    classId: string;
    sectionId: string;
    admissionDate: string;
  };

  parentReferences: {
    primaryParentId: string;
    secondaryParentId?: string;
    emergencyContactPhone: string;
  };

  status: StudentStatus;

  // 🟢 Relations (References Only - No Data Duplication)
  runtimeRelations: {
    activeFeeInvoices: string[]; // Invoice IDs
    recentAttendanceState: "Present" | "Absent" | "Late" | "HalfDay" | null;
    busRouteId?: string;
    hostelRoomId?: string;
  };

  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}
