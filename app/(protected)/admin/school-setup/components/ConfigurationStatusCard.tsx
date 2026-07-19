// app/(protected)/admin/school-setup/components/ConfigurationStatusCard.tsx
import { InfoCard, InfoRow } from "./InfoCard";
import { ShieldCheck } from "lucide-react";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";

export function ConfigurationStatusCard({ config }: { config: SchoolConfigurationViewModel }) {
  return (
    <InfoCard title="Configuration Status" icon={<ShieldCheck className="text-purple-600" size={18} />}>
      <InfoRow label="Current State" value={config.stateLabel} />
      <InfoRow label="Version" value={config.versionLabel} />
      <InfoRow label="Published At" value={config.completionLabel} />
    </InfoCard>
  );
}
