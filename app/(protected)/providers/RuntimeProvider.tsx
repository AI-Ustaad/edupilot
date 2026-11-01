"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ServerCog, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useConfiguration } from "./ConfigurationProvider";
import { useRuntimeStore } from "@/lib/store/runtime.store";
import { useAuth } from "@/context/AuthContext";

export function RuntimeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { config, isLoading, error } = useConfiguration();
  const initializeKernel = useRuntimeStore((state) => state.initializeKernel);

  const cfg = config as any;
  const isPublished = Boolean(
    cfg && (cfg.state === "Published" || cfg.status === "Published" || cfg.stateLabel === "Published" || cfg.state === "CONFIGURED" || cfg.status === "CONFIGURED")
  );
  const hasProfile = Boolean(cfg?.school?.name || cfg?.schoolName);
  const hasAcademic = Boolean(
    cfg?.academic?.classes?.length ||
    (Array.isArray(cfg?.classes) && cfg.classes.length > 0) ||
    (Array.isArray(cfg?.subjects) && cfg.subjects.length > 0)
  );
  const isValidConfig = Boolean(cfg && (isPublished || (hasProfile && hasAcademic)));

  useEffect(() => {
    if (isValidConfig) {
      const tenantId = cfg.tenantId || cfg.metadata?.tenantId || user?.tenantId || "";
      if (tenantId) {
        initializeKernel(tenantId, cfg);
      }
    }
  }, [cfg, isValidConfig, user?.tenantId, initializeKernel]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 z-50 fixed inset-0">
        <ServerCog className="w-14 h-14 text-blue-600 animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800">Initializing Runtime Kernel...</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Bootstrapping Enterprise Environment</p>
      </div>
    );
  }

  // Allow setup and configuration pages to always render without being blocked by initialization errors
  const isSetupOrSettingsPage = 
    pathname?.includes("/admin/school-setup") || 
    pathname?.includes("/settings") ||
    pathname?.includes("/onboarding");
    
  if (isSetupOrSettingsPage) {
    return <>{children}</>;
  }

  if (error || !config || (!isPublished && !isValidConfig)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6 text-center z-50 fixed inset-0">
        <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
        <h2 className="text-2xl font-black text-red-700 mb-2">System Initialization Failed</h2>
        <p className="text-slate-700 mt-2 max-w-md font-medium">
          Unable to load School Configuration. Please ensure the configuration is fully setup and published by the Administrator.
        </p>
        
        <div className="mt-6 bg-white border border-red-200 rounded-xl p-6 text-left shadow-sm max-w-md w-full">
          <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Configuration Diagnostics</h3>
          <DiagnosticItem label="Configuration Document Loaded" isOk={!!cfg} />
          <DiagnosticItem label="State is 'Published'" isOk={isPublished} />
          <DiagnosticItem label="Metadata Exists" isOk={Boolean(cfg?.metadata || cfg?.id)} />
          <DiagnosticItem label="School Profile Exists" isOk={hasProfile} />
          <DiagnosticItem label="Academic Structure Exists" isOk={hasAcademic} />
        </div>

        <button 
          onClick={() => window.location.href = "/admin/school-setup"}
          className="mt-6 bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition flex items-center gap-2"
        >
          Go to Configuration Setup
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

function DiagnosticItem({ label, isOk }: { label: string, isOk: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      {isOk ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
    </div>
  );
}
