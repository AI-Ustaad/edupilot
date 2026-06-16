"use client";
import { useState } from "react";
import { Award, Plus, Save, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";

export default function SkillsPage() {
  const [saving, setSaving] = useState(false);
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      alert("Skill recorded successfully!");
      setSaving(false);
    }, 1000);
  };

  return (
    <RequirePermission permissions={["skills.create" as any]}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
          <Award className="text-purple-600" /> Student Skills & Achievements
        </h1>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus size={20} className="text-purple-500" /> Award New Skill
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Select Student</label>
              <select className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500" required>
                <option value="">Choose a student...</option>
                <option value="1">Ali Khan</option>
                <option value="2">Ayesha Tariq</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">Skill Category</label>
              <select className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500" required>
                <option value="">Select Category...</option>
                <option value="leadership">Leadership</option>
                <option value="communication">Communication</option>
                <option value="creativity">Creativity</option>
                <option value="teamwork">Teamwork</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-bold text-gray-700 block mb-1">Comments / Reason</label>
              <input type="text" placeholder="e.g., Led the science project group exceptionally well." className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Saving..." : "Award Skill"}
          </button>
        </form>
      </div>
    </RequirePermission>
  );
}
