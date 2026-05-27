"use client";
import { useEffect, useState } from "react";
import { Loader2, Bus } from "lucide-react";

export default function ManageBuses() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ busNumber: "", route: "", driverName: "", driverPhone: "" });

  const fetchBuses = async () => {
    const res = await fetch("/api/buses");
    const data = await res.json();
    setBuses(data);
    setLoading(false);
  };

  useEffect(() => { fetchBuses(); }, []);

  const addBus = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/buses", { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
    setForm({ busNumber: "", route: "", driverName: "", driverPhone: "" });
    fetchBuses();
  };

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Bus Tracking (Admin)</h1>
      <form onSubmit={addBus} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-white p-4 rounded-xl shadow">
        <input placeholder="Bus Number" value={form.busNumber} onChange={e => setForm({...form, busNumber: e.target.value})} className="border rounded p-2" required />
        <input placeholder="Route (e.g., Garden→Mall)" value={form.route} onChange={e => setForm({...form, route: e.target.value})} className="border rounded p-2" required />
        <input placeholder="Driver Name" value={form.driverName} onChange={e => setForm({...form, driverName: e.target.value})} className="border rounded p-2" />
        <input placeholder="Driver Phone" value={form.driverPhone} onChange={e => setForm({...form, driverPhone: e.target.value})} className="border rounded p-2" />
        <button type="submit" className="bg-blue-600 text-gray-900 px-4 py-2 rounded-xl col-span-2">Add Bus</button>
      </form>
      <div className="space-y-3">
        {buses.map(bus => (
          <div key={bus.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
            <div><Bus className="inline mr-2" size={18}/> {bus.busNumber} - {bus.route}</div>
            <div className="text-sm text-slate-500">Driver: {bus.driverName} | {bus.driverPhone}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
