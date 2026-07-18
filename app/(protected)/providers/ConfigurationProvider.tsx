"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { MasterSchoolConfiguration } from "@/types/configuration";

// 🟢 Enterprise Type for History
interface ConfigurationHistory {
  id: string;
  version: {
    number: number;
    reason?: string;
    createdAt?: string;
  };
}

interface ConfigContextType {
  config: MasterSchoolConfiguration | null;
  history: ConfigurationHistory[];
  isLoading: boolean;
  error: Error | null; // 🟢 Strict Error Type
}

const ConfigurationContext = createContext<ConfigContextType>({
  config: null,
  history: [],
  isLoading: true,
  error: null,
});

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["enterprise-runtime-config"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/school-configuration");
      const payload = res.data?.data ?? res.data;
      return {
        configuration: payload?.configuration as MasterSchoolConfiguration | undefined,
        history: (payload?.history || []) as ConfigurationHistory[]
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return (
    <ConfigurationContext.Provider value={{ 
      config: data?.configuration || null, 
      history: data?.history || [], 
      isLoading, 
      error: error as Error | null
    }}>
      {children}
    </ConfigurationContext.Provider>
  );
}

export const useConfiguration = () => useContext(ConfigurationContext);
