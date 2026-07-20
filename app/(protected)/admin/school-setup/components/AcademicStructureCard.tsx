// app/(protected)/admin/school-setup/components/AcademicStructureCard.tsx
import { InfoCard } from "./InfoCard";
import { BookOpen } from "lucide-react";
import type { SchoolConfigurationViewModel } from "@/types/viewmodels/school-configuration.viewmodel";

export function AcademicStructureCard({ config }: { config: SchoolConfigurationViewModel }) {
  return (
    <InfoCard title="Academic Structure" icon={<BookOpen className="text-green-600" size={18} />}>
      <div className="space-y-3">
        {/* Classes List (Names instead of Numbers) */}
        <div>
          <span className="text-gray-500 font-medium block mb-1.5">Classes Offered:</span>
          <div className="flex flex-wrap gap-2">
            {config.classes && config.classes.length > 0 ? (
              config.classes.map(cls => (
                <span key={cls.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold">
                  {cls.name}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No classes configured.</span>
            )}
          </div>
        </div>

        {/* Sections List */}
        <div className="flex items-center justify-between border-b border-gray-50 pb-2 pt-1">
          <span className="text-gray-500 font-medium">Sections Template:</span>
          <span className="text-gray-900 font-bold text-right">
            {config.sectionNames?.join(", ") || "N/A"}
          </span>
        </div>

        {/* Subjects Count */}
        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
          <span className="text-gray-500 font-medium">Subjects Mapped:</span>
          <span className="text-gray-900 font-bold text-right">{config.subjectCount} subjects</span>
        </div>
        
        {/* Labs & Facilities List */}
        <div>
          <span className="text-gray-500 font-medium block mb-1.5">Laboratories & Facilities:</span>
          <div className="flex flex-wrap gap-2">
            {config.requiredLabs && config.requiredLabs.length > 0 ? (
              config.requiredLabs.map(lab => (
                <span key={lab} className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs font-bold">
                  {lab}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No specific labs required by curriculum.</span>
            )}
          </div>
        </div>
      </div>
    </InfoCard>
  );
}
