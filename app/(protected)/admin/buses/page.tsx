"use client";
import { useState } from "react";
import { Loader2, Plus, Trash2, Bus } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useBuses, useSaveBus, useDeleteBus } from "@/hooks/useAdmin";
import { TableSkeleton } from "@/components/Skeletons";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

export default function BusesPage() {
  const { data: buses = [], isLoading } = useBuses();
  const saveMutation = useSaveBus();
  const deleteMutation = useDeleteBus();
  const [form, setForm] = useState({ busNumber: "", route: "", driverName: "", driverContact: "", capacity: "" });
  const [busToDelete, setBusToDelete] = useState<{ id: string; busNumber: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(
      { ...form, capacity: form.capacity ? parseInt(form.capacity) : undefined },
      { onSuccess: () => setForm({ busNumber: "", route: "", driverName: "", driverContact: "", capacity: "" }) }
    );
  };

  const handleConfirmDelete = () => {
    if (!busToDelete) return;
    deleteMutation.mutate(busToDelete.id, {
      onSettled: () => setBusToDelete(null),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Bus className="text-blue-600"/> Bus Management</h1>

      <RequirePermission permissions={[PERMISSIONS.buses.create]}>
        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Bus Number *" value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input placeholder="Route *" value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input placeholder="Driver Name" value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
            <input placeholder="Capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18}/> Add Bus</>}
          </button>
        </form>
      </RequirePermission>

      {isLoading ? <TableSkeleton rows={4} cols={2} /> : (
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg mb-4 text-gray-800">All Buses</h2>
          {buses.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No buses found.</p>
          ) : (
            <div className="space-y-3">
              {buses.map((bus: any) => (
                <div key={bus.id} className="flex items-center justify-between border-b pb-3 pt-2 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{bus.busNumber}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Capacity: {bus.capacity || 40} seats
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mt-0.5">{bus.route} {bus.driverName && <span className="text-gray-400 ml-1">| Driver: {bus.driverName}</span>}</p>
                  </div>
                  <button
                    onClick={() => setBusToDelete({ id: bus.id, busNumber: bus.busNumber })}
                    disabled={deleteMutation.isPending && deleteMutation.variables === bus.id}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                    title="Delete Bus"
                  >
                    {deleteMutation.isPending && deleteMutation.variables === bus.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!busToDelete}
        title="Delete Bus"
        description="Are you sure you want to remove this bus from the fleet? This action cannot be undone."
        itemName={busToDelete ? `Bus: ${busToDelete.busNumber}` : undefined}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setBusToDelete(null)}
      />
    </div>
  );
}
