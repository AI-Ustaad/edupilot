"use client";
import { useEffect, useState } from "react";
import { Loader2, Bus, Plus, Trash2 } from "lucide-react";

export default function ManageBuses() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ busNumber: "", route: "", driverName: "", driverPhone: "" });

  const fetchBuses = async () => {
    try {
      const res = await fetch("/api/buses");
      if (res.ok) {
        const data = await res.json();
        setBuses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBuses(); }, []);

  const addBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/buses", {
        method: "POST",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });
      setForm({ busNumber: "", route: "", driverName: "", driverPhone: "" });
      fetchBuses();
    } catch (err) {
      alert("Failed to add bus");
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary" size={40}/></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
        <Bus className="text-primary" /> Bus Management
      </h1>

      {/* Add Form */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 text-white">Add New Bus</h2>
        <form onSubmit={addBus} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            placeholder="Bus Number"
            value={form.busNumber}
            onChange={e => setForm({...form, busNumber: e.target.value})}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <input
            placeholder="Route (e.g., Garden→Mall)"
            value={form.route}
            onChange={e => setForm({...form, route: e.target.value})}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
          <input
            placeholder="Driver Name"
            value={form.driverName}
            onChange={e => setForm({...form, driverName: e.target.value})}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            placeholder="Driver Phone"
            value={form.driverPhone}
            onChange={e => setForm({...form, driverPhone: e.target.value})}
            className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button type="submit" className="btn-primary col-span-2 flex items-center justify-center gap-2">
            <Plus size={18} /> Add Bus
          </button>
        </form>
      </div>

      {/* Bus List */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-white/10">
          {buses.map(bus => (
            <div key={bus.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-white/5 transition-colors">
              <div>
                <p className="font-bold text-white flex items-center gap-2"><Bus size={18} className="text-secondary"/> {bus.busNumber}</p>
                <p className="text-sm text-white/60">Route: {bus.route}</p>
              </div>
              <div className="text-sm text-white/50">
                Driver: {bus.driverName} | {bus.driverPhone}
              </div>
            </div>
          ))}
          {buses.length === 0 && (
            <p className="p-6 text-center text-white/40">No buses added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
