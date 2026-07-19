// app/(protected)/admin/school-setup/components/CurriculumWizard.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, Wand2, Save } from "lucide-react";
import apiClient from "@/lib/api/client";
import { useToast } from "@/components/ToastProvider";
import { MASTER_CATALOG } from "@/lib/data/master-catalog.data";

export function CurriculumWizard({ onGenerated }: { onGenerated: (data: any) => void }) {
  const { showToast } = useToast();
  
  // School Profile State
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState("Private");
  const [sections, setSections] = useState("A, B");
  
  // Curriculum Selection State
  const [countryId, setCountryId] = useState("");
  const [systemId, setSystemId] = useState("");
  const [authorityId, setAuthorityId] = useState("");
  const [versionId, setVersionId] = useState("");
  
  // Engine State
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  // Dynamic Dropdowns Logic
  const selectedCountry = MASTER_CATALOG.find(c => c.id === countryId);
  const selectedSystem = selectedCountry?.systems.find(s => s.id === systemId);
  const selectedAuthority = selectedSystem?.authorities.find(a => a.id === authorityId);
  const selectedVersion = selectedAuthority?.curriculumVersions.find(v => v.id === versionId);

  useEffect(() => {
    if (selectedVersion) {
      setAvailableLevels(selectedVersion.levels.map(l => l.id));
      setSelectedLevels([]);
      setGeneratedData(null); // Reset generated data if selection changes
    }
  }, [selectedVersion]);

  const handleGenerate = async () => {
    if (!countryId || !systemId || !authorityId || !versionId || selectedLevels.length === 0) {
      showToast("Please complete curriculum selection steps.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiClient.post("/curriculum/engine", {
        countryId, systemId, authorityId, versionId, selectedLevelIds: selectedLevels
      });
      
      const payload = res.data?.data ?? res.data;
      setGeneratedData(payload);
      showToast("Curriculum structure generated! Review and save.", "success");
    } catch (error) {
      showToast("Failed to generate curriculum.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!schoolName || !generatedData) {
      showToast("Please enter school name and generate structure first.", "error");
      return;
    }

    // Combine Profile + Generated Academic Structure
    onGenerated({
      schoolProfile: {
        name: schoolName,
        type: schoolType,
        curriculumId: systemId,
        boardName: selectedAuthority?.name || "Custom Board",
        country: countryId,
        sections: sections.split(",").map(s => s.trim()).filter(Boolean)
      },
      academicStructure: generatedData
    });
  };

  return (
    <div className="bg-white border shadow-sm rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Search size={20} className="text-indigo-600" /> Autonomous Configuration Wizard
      </h2>

      {/* Step 1: School Profile */}
      <div className="grid md:grid-cols-2 gap-4 pb-4 border-b">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">School Name *</label>
          <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full border p-2.5 rounded-xl" placeholder="e.g. The Educators" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">School Type</label>
          <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)} className="w-full border p-2.5 rounded-xl">
            <option>Private</option>
            <option>Government</option>
            <option>Madrissa</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Default Sections</label>
          <input value={sections} onChange={(e) => setSections(e.target.value)} className="w-full border p-2.5 rounded-xl" placeholder="A, B, C" />
        </div>
      </div>

      {/* Step 2: Curriculum Selection */}
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

      {/* Step 3: Level Selection */}
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

      {/* Action Buttons */}
      <div className="pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-4">
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating || selectedLevels.length === 0}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          {isGenerating ? "Generating..." : "1. Auto-Generate Structure"}
        </button>

        {generatedData && (
          <button 
            onClick={handleSave}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Save size={18} /> 2. Save & Publish Configuration
          </button>
        )}
      </div>

      {/* Preview Generated Data */}
      {generatedData && (
        <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
          <h4 className="font-bold text-gray-700 mb-2">Preview Generated Structure:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><span className="font-bold text-gray-900">{generatedData.grades.length}</span> Classes</div>
            <div><span className="font-bold text-gray-900">{generatedData.allSubjects.length}</span> Subjects</div>
            <div><span className="font-bold text-gray-900">{generatedData.requiredLabs.length}</span> Labs Required</div>
            <div><span className="font-bold text-gray-900">{Object.keys(generatedData.requiredTeachers).length}</span> Teachers Needed</div>
          </div>
        </div>
      )}
    </div>
  );
}
