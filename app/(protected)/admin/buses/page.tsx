"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

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

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Bus Management</h1>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Bus Number *" value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} className="border rounded-xl p-2" required />
          <input placeholder="Route *" value={form.route} onChange={e => setForm({ ...form, route: e.target.value })} className="border rounded-xl p-2" required />
          <input placeholder="Driver Name" value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} className="border rounded-xl p-2" />
          <input placeholder="Driver Contact" value={form.driverContact} onChange={e => setForm({ ...form, driverContact: e.target.value })} className="border rounded-xl p-2" />
          <input placeholder="Capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="border rounded-xl p-2" />
        </div>
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "Add Bus"}
        </button>
      </form>

      {/* List */}
      <div className="bg-white border rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">All Buses</h2>
        {buses.length === 0 ? (
          <p className="text-gray-400">No buses found.</p>
        ) : (
          <div className="space-y-3">
            {buses.map((bus: any) => (
              <div key={bus.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-bold">{bus.busNumber}</p>
                  <p className="text-sm text-gray-500">{bus.route} {bus.driverName && `| Driver: ${bus.driverName}`}</p>
                </div>
                <button onClick={() => handleDelete(bus.id)} className="text-red-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
