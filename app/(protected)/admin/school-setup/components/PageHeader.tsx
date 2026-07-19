// app/(protected)/admin/school-setup/components/PageHeader.tsx
import { School, Settings2 } from "lucide-react";

export function PageHeader({ isConfigured, onEdit }: { isConfigured: boolean; onEdit: () => void }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <School className="text-blue-600" /> {isConfigured ? "School Configuration" : "Complete School Setup"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Your permanent, tenant-scoped academic configuration.</p>
      </div>
      {isConfigured && (
        <button onClick={onEdit} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold flex gap-2 items-center">
          <Settings2 size={17} /> Edit Configuration
        </button>
      )}
    </header>
  );
}
