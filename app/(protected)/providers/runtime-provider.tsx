"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ServerCog } from "lucide-react";
import apiClient from "@/lib/api/client";
import { useRuntimeStore } from "@/lib/store/runtime.store";

export function RuntimeProvider({ children }: { children: React.ReactNode }) {
  const initializeKernel = useRuntimeStore((state) => state.initializeKernel);
  const isInitialized = useRuntimeStore((state) => state.isInitialized);

  const { data: config, isLoading, error } = useQuery({
    queryKey: ["enterprise-runtime-config"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/school-configuration");
      return res.data?.configuration;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (config && config.state === "Published") {
      initializeKernel(config.tenantId || "current_tenant", config);
    }
  }, [config, initializeKernel]);

  if (isLoading || (!isInitialized && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 z-50 fixed inset-0">
        <ServerCog className="w-14 h-14 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800">Initializing Runtime Kernel...</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Bootstrapping Enterprise Environment</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6 text-center z-50 fixed inset-0">
        <h2 className="text-2xl font-black text-red-600">System Initialization Failed</h2>
        <p className="text-slate-700 mt-2 max-w-md">
          Unable to load School Configuration. Please ensure the configuration is fully setup and published by the Administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
