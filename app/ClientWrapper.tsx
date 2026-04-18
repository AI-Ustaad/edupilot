"use client";

import React from "react";
// 🚀 FIXED: Using standard Absolute Path
import { AuthProvider } from "@/context/AuthContext";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
