// app/(protected)/admin/school-setup/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSchoolConfiguration, useSaveSchoolConfiguration } from "@/hooks/useSchoolConfiguration";
import { PageHeader } from "./components/PageHeader";
import { SchoolProfileCard } from "./components/SchoolProfileCard";
import { AcademicStructureCard } from "./components/AcademicStructureCard";
import { ConfigurationStatusCard } from "./components/ConfigurationStatusCard";
import { ConfigurationHistoryCard } from "./components/ConfigurationHistoryCard";
import { SmartConfigurationWizard } from "./components/SmartConfigurationWizard";

function SchoolConfigurationContent() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useSchoolConfiguration();
  const saveMutation = useSaveSchoolConfiguration();
  
  const [editing, setEditing] = useState(searchParams.get("edit") === "true");
  
  const config = data?.configuration;
  const history = data?.history || [];
  const isConfigured = config?.state === "Published";

  if (isLoading) return <div className="flex h-72 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const handleWizardComplete = (payload: any) => {
    saveMutation.mutate(payload, {
      onSuccess: () => setEditing(false)
    });
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        <PageHeader isConfigured={isConfigured} onEdit={() => setEditing(true)} />

        {isConfigured && !editing ? (
          <>
            <div className="grid md:grid-cols-3 gap-4">
              {config && <SchoolProfileCard config={config} />}
              {config && <AcademicStructureCard config={config} />}
              {config && <ConfigurationStatusCard config={config} />}
            </div>
            <ConfigurationHistoryCard history={history} />
          </>
        ) : (
          <div className="space-y-6">
            {isConfigured && (
              <div className="flex justify-between items-center bg-blue-50 border border-blue-200 p-4 rounded-2xl">
                <div>
                  <h3 className="font-bold text-blue-900 text-sm">Editing Existing Configuration</h3>
                  <p className="text-xs text-blue-700">Updating settings will automatically synchronize classes, sections, and fee structures.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-white text-gray-700 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel / Return to Overview
                </button>
              </div>
            )}
            
            <SmartConfigurationWizard
              initialConfig={config}
              onGenerated={handleWizardComplete}
            />
            
            {saveMutation.isPending && (
              <div className="flex justify-center items-center text-blue-600 font-bold text-lg">
                <Loader2 className="animate-spin mr-2" /> Saving & Synchronizing Configuration...
              </div>
            )}
          </div>
        )}
      </div>
    </RequirePermission>
  );
}

export default function SchoolConfigurationPage() {
  return (
    <Suspense fallback={<div className="flex h-72 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
      <SchoolConfigurationContent />
    </Suspense>
  );
}
