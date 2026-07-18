// app/(protected)/providers/ConfigurationProvider.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { MasterSchoolConfiguration } from "@/types/configuration";

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

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["enterprise-runtime-config"],
    queryFn: async () => {
      // 🚀 apiClient already has /api/v1 as baseURL, so we just use /settings/school-configuration
      const res = await apiClient.get("/settings/school-configuration");
      
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

export const useConfiguration = () => useContext(ConfigurationContext);
