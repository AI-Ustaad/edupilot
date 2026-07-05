"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, School, BookOpen, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { CURRICULUMS } from "@/lib/curriculum-data";
import { useToast } from "@/components/ToastProvider";

export default function SchoolSetupWizard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [schoolType, setSchoolType] = useState<"Private" | "Government" | "Madrissa">("Private");
  const [curriculumId, setCurriculumId] = useState<string>("federal");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const availableCurriculums = CURRICULUMS.filter(c => {
    if (schoolType === "Madrissa") return c.id === "wifaq";
    if (schoolType === "Government") return c.id === "federal" || c.id === "punjab"; // Assuming punjab exists or will be added
    return true; // Private can choose any
  });

  const availableLevels = schoolType === "Madrissa" 
    ? [{ key: "madrissa", label: "Madrissa Levels" }]
    : [
        { key: "primary", label: "Primary (Prep - Class 5)" },
        { key: "elementary", label: "Elementary (Class 6 - 8)" },
        { key: "high", label: "Secondary (Class 9 - 10)" }
      ];

  const handleApply = async () => {
    setLoading(true);
    try {
      const curriculum = CURRICULUMS.find(c => c.id === curriculumId);
      let classesToCreate: any[] = [];
      let subjectsToCreate = new Set<string>();

      if (curriculum) {
        selectedLevels.forEach(levelKey => {
          const levelData = curriculum.levels[levelKey as keyof typeof curriculum.levels];
          if (levelData) {
            levelData.forEach(cls => {
              classesToCreate.push({ name: cls.name, sections: [] });
              cls.subjects.forEach(sub => subjectsToCreate.add(sub.name));
            });
          }
        });
      }

      if (classesToCreate.length === 0) {
        showToast("No classes found for selected levels.", "error");
        setLoading(false);
        return;
      }

      await apiClient.post("/settings/curriculum", { 
        schoolType, 
        curriculum: curriculumId, 
        levels: selectedLevels,
        classes: classesToCreate, 
        subjects: Array.from(subjectsToCreate) 
      });

      showToast("School setup completed successfully!", "success");
      setTimeout(() => router.push("/settings"), 2000);

    } catch (err) {
      showToast("Failed to apply settings.", "error");
      setLoading(false);
    }
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <School className="text-blue-600" /> School Setup Wizard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Automatically configure Classes and Subjects based on your school type.</p>
        </div>

        {/* Step 1: School Type */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-lg font-bold">Step 1: Select School Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Private", "Government", "Madrissa"].map((type) => (
                <button
                  key={type}
                  onClick={() => { 
                    setSchoolType(type as any); 
                    setCurriculumId(type === "Madrissa" ? "wifaq" : "federal");
                    setSelectedLevels([]);
                  }}
                  className={`p-6 rounded-xl border-2 font-bold transition ${schoolType === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2">
              Next <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Curriculum & Levels */}
        {step === 2 && (
          <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
            <h2 className="text-lg font-bold">Step 2: Curriculum & Levels</h2>
            
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Education Board / System</label>
              <select 
                value={curriculumId} 
                onChange={(e) => setCurriculumId(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
              >
                {availableCurriculums.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                {schoolType === "Private" && <option value="custom">Custom / Private Board</option>}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Levels Offered</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableLevels.map((level) => (
                  <button
                    key={level.key}
                    onClick={() => setSelectedLevels(prev => prev.includes(level.key) ? prev.filter(l => l !== level.key) : [...prev, level.key])}
                    className={`p-4 rounded-xl border-2 font-bold text-sm transition ${selectedLevels.includes(level.key) ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-200 text-gray-600'}`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="w-full bg-gray-200 text-gray-700 p-4 rounded-xl font-bold flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={handleApply} 
                disabled={loading || selectedLevels.length === 0 || !curriculumId}
                className="w-full bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                {loading ? "Applying Settings..." : "Apply Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
