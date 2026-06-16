"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function BusesPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ busNumber: "", route: "", driverName: "", driverContact: "", capacity: "" });
  const [saving, setSaving] = useState(false);

  const fetchBuses = async () => {
    const res = await fetch("/api/buses");
    const json = await res.json();
    setBuses(json.data || json);
    setLoading(false);
  };

  useEffect(() => { fetchBuses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        busNumber: form.busNumber,
        route: form.route,
        driverName: form.driverName,
        driverContact: form.driverContact,
        capacity: form.capacity ? parseInt(form.capacity) : undefined,
      }),
    });
    setForm({ busNumber: "", route: "", driverName: "", driverContact: "", capacity: "" });
    await fetchBuses();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bus?")) return;
    await fetch(`/api/buses/${id}`, { method: "DELETE" });
    fetchBuses();
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Bus Management</h1>

      {/* 🛡️ Protected Add Form */}
      <RequirePermission permissions={[PERMISSIONS.buses.create]}>
        <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Bus Number *" value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input placeholder="Route *" value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input placeholder="Driver Name" value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
            <input placeholder="Driver Contact" value={form.driverContact} onChange={e => setForm({ ...form, driverContact: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
            <input placeholder="Capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18}/> Add Bus</>}
          </button>
        </form>
      </RequirePermission>

      {/* List */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-4 text-gray-800">All Buses</h2>
        {buses.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No buses found.</p>
        ) : (
          <div className="space-y-3">
            {buses.map((bus: any) => (
              <div key={bus.id} className="flex items-center justify-between border-b pb-3 pt-2 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                <div>
                  <p className="font-bold text-gray-900">{bus.busNumber}</p>
                  <p className="text-sm text-gray-500 font-medium">{bus.route} {bus.driverName && <span className="text-gray-400 ml-1">| Driver: {bus.driverName}</span>}</p>
                </div>
                
                {/* 🛡️ Protected Delete Button */}
                <RequirePermission permissions={[PERMISSIONS.buses.delete]}>
                  <button onClick={() => handleDelete(bus.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete Bus">
                    <Trash2 size={18} />
                  </button>
                </RequirePermission>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
