"use client";

import { useAuth } from "@/context/AuthContext";

export default function ClientWrapper({ children }: any) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}
