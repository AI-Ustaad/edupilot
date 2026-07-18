// app/(protected)/providers/ConfigurationProvider.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { MasterSchoolConfiguration } from "@/types/configuration";

// 1. Create Context
interface ConfigContextType {
  config: MasterSchoolConfiguration | null;
  isLoading: boolean;
  error: any;
}

const ConfigurationContext = createContext<ConfigContextType>({
  config: null,
  isLoading: true,
  error: null,
});

// 2. Create Provider
export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["enterprise-runtime-config"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/school-configuration");
      
      // 🚀 FIX: Safely unwrap the API response (res.data.data.configuration)
      const payload = res.data?.data ?? res.data;
      return payload?.configuration as MasterSchoolConfiguration | undefined;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  return (
    <ConfigurationContext.Provider value={{ config: data || null, isLoading, error }}>
      {children}
    </ConfigurationContext.Provider>
  );
}

// 3. Create Hook for easy access
export const useConfiguration = () => useContext(ConfigurationContext);
