"use client";
import { AuthProvider } from "@/context/AuthContext";

export function ClientAuthWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
