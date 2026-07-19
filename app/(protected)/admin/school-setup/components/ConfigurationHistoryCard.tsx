// app/(protected)/admin/school-setup/components/ConfigurationHistoryCard.tsx
import { InfoCard } from "./InfoCard";
import { History } from "lucide-react";
import type { ConfigurationHistoryViewModel } from "@/types/viewmodels/configuration-history.viewmodel";

export function ConfigurationHistoryCard({ history }: { history: ConfigurationHistoryViewModel[] }) {
  return (
    <div className="md:col-span-3 bg-white border rounded-2xl p-6">
      <h2 className="font-bold flex gap-2 items-center mb-4"><History size={18} /> Configuration History</h2>
      <div className="mt-3 text-sm text-slate-600 space-y-2">
        {history.length ? (
          history.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-slate-50 pb-1">
              <span className="font-medium text-slate-800">{item.versionLabel}</span>
              <span className="text-slate-500">{item.reason} ({item.formattedDate})</span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 font-medium">No configuration changes recorded yet.</p>
        )}
      </div>
    </div>
  );
}
