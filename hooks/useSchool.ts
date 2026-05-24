"use client";
import { useAuth } from "@/context/AuthContext";

export function useSchool() {
  const { user } = useAuth();
  if (!user) {
    throw new Error("User not loaded");
  }
  return {
    schoolId: user.tenantId,   // ✅ changed from user.schoolId to user.tenantId
    role: user.role,
  };
}
