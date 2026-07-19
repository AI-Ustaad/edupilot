// app/(protected)/admin/school-setup/page.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useSchoolConfiguration, useSaveSchoolConfiguration } from "@/hooks/useSchoolConfiguration";
import { PageHeader } from "./components/PageHeader";
import { SchoolProfileCard } from "./components/SchoolProfileCard";
import { AcademicStructureCard } from "./components/AcademicStructureCard";
import { ConfigurationStatusCard } from "./components/ConfigurationStatusCard";
import { ConfigurationHistoryCard } from "./components/ConfigurationHistoryCard";
import { ConfigurationEditor } from "./components/ConfigurationEditor";

export default function SchoolConfigurationPage() {
  const { data, isLoading } = useSchoolConfiguration();
  const saveMutation = useSaveSchoolConfiguration();
  
  const [editing, setEditing] = useState(false);
  
  const config = data?.configuration;
  const history = data?.history || [];
  const isConfigured = config?.state === "Published";

  if (isLoading) return <div className="flex h-72 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

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
          <ConfigurationEditor 
            initialData={config || null} 
            onSave={(input) => {
              saveMutation.mutate(input, { onSuccess: () => setEditing(false) });
            }} 
            isSaving={saveMutation.isPending} 
          />
        )}
      </div>
    </RequirePermission>
  );
}
