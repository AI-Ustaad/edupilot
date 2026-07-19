// app/(protected)/admin/school-setup/components/InfoCard.tsx
import { ReactNode } from "react";

export function InfoCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-white border rounded-2xl p-5">
      <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">{icon} {title}</h2>
      <div className="space-y-3 text-sm">{children}</div>
    </section>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-bold text-right">{value || "N/A"}</span>
    </div>
  );
}
