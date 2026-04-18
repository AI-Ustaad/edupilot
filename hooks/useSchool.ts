"use client";

import { useAuth } from "@/context/AuthContext";

export function useSchool() {
  const { user } = useAuth();

  if (!user) {
    throw new Error("User not loaded");
  }

  return {
    schoolId: user.schoolId,
    role: user.role,
  };
}
