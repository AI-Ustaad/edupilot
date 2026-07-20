// app/(protected)/admin/school-setup/components/SmartConfigurationWizard.tsx
"use client";

import { useState } from "react";
import { Loader2, Wand2, Save } from "lucide-react";
import { useEducationRulesEngine } from "@/hooks/useEducationRulesEngine";
import { useToast } from "@/components/ToastProvider";
import apiClient from "@/lib/api/client";

export function SmartConfigurationWizard({ onGenerated }: { onGenerated: (data: any) => void }) {
  const { showToast } = useToast();
  
  // Step 1: Institution Profile
  const [schoolName, setSchoolName] = useState("");
  const [ownershipType, setOwnershipType] = useState(""); // Public / Private
  const [institutionType, setInstitutionType] = useState("School"); // School / Madrassah
  const [countryId, setCountryId] = useState("pk");
  
  // 🚀 NEW: Manual Inputs
  const [sections, setSections] = useState("A, B"); 
  const [facilities, setFacilities] = useState(""); // For Grounds, Rooms, etc.
  
  // Step 2: Cascading Selections
  const [authorityId, setAuthorityId] = useState("");
  const [systemId, setSystemId] = useState("");
  const [versionId, setVersionId] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  
  // Step 3: Generated Structure
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch Authorities based on Country, Ownership Type, AND Institution Type
  const { data: authorities = [] } = useEducationRulesEngine(
    "GET_AUTHORITIES", 
    { countryId, ownershipType, institutionType }, 
    !!countryId && !!ownershipType
  );

  const { data: systems = [] } = useEducationRulesEngine("GET_SYSTEMS", { authorityId }, !!authorityId);
  const { data: versions = [] } = useEducationRulesEngine("GET_VERSIONS", { systemId }, !!systemId);
  const { data: levels = [] } = useEducationRulesEngine("GET_LEVELS", { versionId }, !!versionId);

  const handleGenerate = async () => {
    if (!versionId || selectedLevels.length === 0) {
      showToast("Please select curriculum and levels first.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await apiClient.post("/education/rules", {
        action: "GENERATE_STRUCTURE",
        payload: { versionId, selectedLevelIds: selectedLevels }
      });
      
      setGeneratedData(res.data?.data);
      showToast("Structure generated successfully!", "success");
    } catch (error) {
      showToast("Failed to generate structure.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!schoolName || !generatedData) {
      showToast("Missing school name or generated data.", "error");
      return;
    }

    const parsedSections = sections.split(",").map(s => s.trim()).filter(Boolean);
    
    // 🚀 NEW: Parse manual facilities
    const parsedFacilities = facilities.split(",").map(f => f.trim()).filter(Boolean);

    // Merge auto-generated labs with manually entered facilities
    const allLabsAndFacilities = [
      ...(generatedData.requiredLabs || []),
      ...parsedFacilities
    ];

    onGenerated({
      schoolProfile: {
        name: schoolName,
        type: ownershipType === "Public" ? "Government" : "Private",
        curriculumId: systemId,
        boardName: authorities.find(a => a.id === authorityId)?.name || "Custom Board",
        country: countryId,
        sections: parsedSections
      },
      academicStructure: {
        ...generatedData,
        // 🚀 Override requiredLabs with merged list
        requiredLabs: allLabsAndFacilities 
      }
    });
  };

  return (
    <div className="bg-white border shadow-sm rounded-2xl p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <Wand2 size={20} className="text-indigo-600" /> Autonomous Configuration Wizard
      </h2>

      {/* Step 1: Profile */}
      <div className="grid md:grid-cols-2 gap-4 pb-4 border-b">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Institution Name *</label>
          <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full border p-2.5 rounded-xl" placeholder="e.g. The Educators" />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ownership Type *</label>
          <select value={ownershipType} onChange={(e) => { setOwnershipType(e.target.value); setAuthorityId(""); }} className="w-full border p-2.5 rounded-xl">
            <option value="">-- Select Type --</option>
            <option value="Public">Public (Government)</option>
            <option value="Private">Private</option>
          </select>
        </div>
        
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Institution Type *</label>
          <select value={institutionType} onChange={(e) => { setInstitutionType(e.target.value); setAuthorityId(""); }} className="w-full border p-2.5 rounded-xl">
            <option value="School">School (Govt/Private)</option>
            <option value="Madrassah">Madrassah</option>
            <option value="College">College</option>
            <option value="University">University</option>
          </select>
        </div>

        {/* 🚀 NEW: Sections Input Field */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Default Sections *</label>
          <input 
            value={sections} 
            onChange={(e) => setSections(e.target.value)} 
            className="w-full border p-2.5 rounded-xl" 
            placeholder="e.g. A, B, C" 
          />
        </div>
        
        {/* 🚀 NEW: Manual Facilities Input Field */}
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Additional Facilities (Labs, Grounds, Rooms)</label>
          <input 
            value={facilities} 
            onChange={(e) => setFacilities(e.target.value)} 
            className="w-full border p-2.5 rounded-xl" 
            placeholder="e.g. Football Ground, Library Hall, Music Room" 
          />
          <p className="text-[10px] text-gray-400 mt-1">Separate multiple facilities with commas. Auto-generated labs (like Physics Lab) will be added automatically.</p>
        </div>
      </div>

      {/* Step 2: Cascading Curriculum Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">1. Education Authority / Board</label>
          <select value={authorityId} onChange={(e) => { setAuthorityId(e.target.value); setSystemId(""); }} disabled={!ownershipType} className="w-full border p-2.5 rounded-xl disabled:bg-gray-100">
            <option value="">-- Select Authority --</option>
            {authorities.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">2. Education System / Curriculum</label>
          <select value={systemId} onChange={(e) => { setSystemId(e.target.value); setVersionId(""); }} disabled={!authorityId} className="w-full border p-2.5 rounded-xl disabled:bg-gray-100">
            <option value="">-- Select System --</option>
            {systems.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">3. Curriculum Version</label>
          <select value={versionId} onChange={(e) => setVersionId(e.target.value)} disabled={!systemId} className="w-full border p-2.5 rounded-xl disabled:bg-gray-100">
            <option value="">-- Select Version --</option>
            {versions.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
      </div>

      {/* Step 3: Level Selection */}
      {levels.length > 0 && (
        <div className="pt-4 border-t">
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">4. Select Academic Levels Offered</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {levels.map((level: any) => (
              <button
                type="button"
                key={level.id}
                onClick={() => setSelectedLevels(prev => prev.includes(level.id) ? prev.filter(l => l !== level.id) : [...prev, level.id])}
                className={`p-3 rounded-xl border-2 font-bold text-sm transition ${selectedLevels.includes(level.id) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"}`}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t flex flex-col md:flex-row justify-between items-center gap-4">
        <button onClick={handleGenerate} disabled={isGenerating || selectedLevels.length === 0} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />} 1. Auto-Generate Structure
        </button>

        {generatedData && (
          <button onClick={handleSave} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
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
            <div><span className="font-bold text-gray-900">{generatedData.requiredLabs.length + (facilities ? facilities.split(',').filter(Boolean).length : 0)}</span> Labs/Facilities</div>
            <div><span className="font-bold text-gray-900">{generatedData.departments.length}</span> Departments</div>
          </div>
        </div>
      )}
    </div>
  );
}
