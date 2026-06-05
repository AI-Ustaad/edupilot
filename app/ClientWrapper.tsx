"use client";
export const dynamic = 'force-dynamic';

import { AuthProvider } from "@/context/AuthContext";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
