// app/(protected)/admin/school-setup/components/AcademicStructureCard.tsx
import { InfoCard, InfoRow } from "./InfoCard";
import { BookOpen } from "lucide-react";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";

export function AcademicStructureCard({ config }: { config: SchoolConfigurationViewModel }) {
  return (
    <InfoCard title="Academic Structure" icon={<BookOpen className="text-green-600" size={18} />}>
      <InfoRow label="Classes" value={config.classSummary} />
      <InfoRow label="Sections" value={`${config.sectionCount} section template(s)`} />
      <InfoRow label="Subjects" value={`${config.subjectCount} subjects`} />
    </InfoCard>
  );
}
