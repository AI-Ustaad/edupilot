// app/(protected)/admin/school-setup/components/SchoolProfileCard.tsx
import { InfoCard, InfoRow } from "./InfoCard";
import { Building2 } from "lucide-react";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";

export function SchoolProfileCard({ config }: { config: SchoolConfigurationViewModel }) {
  return (
    <InfoCard title="School Profile" icon={<Building2 className="text-blue-600" size={18} />}>
      <InfoRow label="School Name" value={config.schoolName} />
      <InfoRow label="School Type" value={config.schoolType} />
      <InfoRow label="Board" value={config.boardName} />
    </InfoCard>
  );
}
