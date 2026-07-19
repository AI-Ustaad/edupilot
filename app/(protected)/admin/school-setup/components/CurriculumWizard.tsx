// app/(protected)/admin/school-setup/components/CurriculumWizard.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Wand2 } from "lucide-react";
import apiClient from "@/lib/api/client";
import { useToast } from "@/components/ToastProvider";

// Fetch Countries from our new Master Catalog Data directly on client (for demo purposes)
// In a real enterprise app, this would be an API call. We import it directly for speed.
import { MASTER_CATALOG } from "@/lib/data/master-catalog.data";

export function CurriculumWizard({ onGenerated }: { onGenerated: (data: any) => void }) {
  const { showToast } = useToast();
  
  // Step 1 States
  const [countryId, setCountryId] = useState("");
  const [systemId, setSystemId] = useState("");
  const [authorityId, setAuthorityId] = useState("");
  const [versionId, setVersionId] = useState("");
  
  // Step 2 States
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  
  // Step 3 State
  const [isGenerating, setIsGenerating] = useState(false);

  // Dynamic Dropdowns Logic
  const selectedCountry = MASTER_CATALOG.find(c => c.id === countryId);
  const selectedSystem = selectedCountry?.systems.find(s => s.id === systemId);
  const selectedAuthority = selectedSystem?.authorities.find(a => a.id === authorityId);
  const selectedVersion = selectedAuthority?.curriculumVersions.find(v => v.id === versionId);

  // When version changes, load available levels dynamically
  useEffect(() => {
    if (selectedVersion) {
      setAvailableLevels(selectedVersion.levels.map(l => l.id));
      setSelectedLevels([]); // Reset selection
    }
  }, [selectedVersion]);

  const handleGenerate = async () => {
    if (!countryId || !systemId || !authorityId || !versionId || selectedLevels.length === 0) {
      showToast("Please complete all selection steps.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiClient.post("/curriculum/engine", {
        countryId, systemId, authorityId, versionId, selectedLevelIds: selectedLevels
      });
      
      const payload = res.data?.data ?? res.data;
      onGenerated(payload); // Pass data back to parent page
      showToast("Curriculum structure generated successfully!", "success");
    } catch (error) {
      showToast("Failed to generate curriculum.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border shadow-sm rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Search size={20} className="text-indigo-600" /> Curriculum Intelligence Wizard
      </h2>

      {/* Step 1: Country & System Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">1. Select Country</label>
          <select value={countryId} onChange={(e) => { setCountryId(e.target.value); setSystemId(""); }} className="w-full border p-2.5 rounded-xl">
            <option value="">-- Select --</option>
            {MASTER_CATALOG.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">2. Education System</label>
          <select value={systemId} onChange={(e) => { setSystemId(e.target.value); setAuthorityId(""); }} disabled={!selectedCountry} className="w-full border p-2.5 rounded-xl disabled:bg-gray-100">
            <option value="">-- Select --</option>
            {selectedCountry?.systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">3. Education Authority / Board</label>
          <select value={authorityId} onChange={(e) => { setAuthorityId(e.target.value); setVersionId(""); }} disabled={!selectedSystem} className="w-full border p-2.5 rounded-xl disabled:bg-gray-100">
            <option value="">-- Select --</option>
            {selectedSystem?.authorities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">4. Curriculum Version</label>
          <select value={versionId} onChange={(e) => setVersionId(e.target.value)} disabled={!selectedAuthority} className="w-full border p-2.5 rounded-xl disabled:bg-gray-100">
            <option value="">-- Select --</option>
            {selectedAuthority?.curriculumVersions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      {/* Step 2: Level Selection (Auto-populated) */}
      {availableLevels.length > 0 && (
        <div className="pt-4 border-t">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">5. Select Academic Levels Offered</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableLevels.map(levelId => {
              const levelData = selectedVersion?.levels.find(l => l.id === levelId);
              return (
                <button
                  type="button"
                  key={levelId}
                  onClick={() => setSelectedLevels(prev => prev.includes(levelId) ? prev.filter(l => l !== levelId) : [...prev, levelId])}
                  className={`p-3 rounded-xl border-2 font-bold text-sm transition ${selectedLevels.includes(levelId) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
                >
                  {levelData?.name || levelId}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Generate Button */}
      <div className="pt-4 border-t flex justify-end">
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || selectedLevels.length === 0}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          {isGenerating ? "Generating..." : "Auto-Generate Structure"}
        </button>
      </div>
    </div>
  );
}
