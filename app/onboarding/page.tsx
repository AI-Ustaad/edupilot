"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, School, Building, BookOpen, CheckCircle } from "lucide-react";
import apiClient from "@/lib/api/client"; // Using Axios instead of fetch
import { CURRICULUMS, ClassLevel } from "@/lib/data/curriculums";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState<"Private" | "Government" | "Madrissa">("Private");
  const [curriculumId, setCurriculumId] = useState<string>("federal"); // Default Federal
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]); // e.g., ["primary", "high"]

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Curriculum Filter کر کے Classes اور Subjects نکالیں
      const curriculum = CURRICULUMS.find(c => c.id === curriculumId);
      let classesToCreate: any[] = [];
      let subjectsToCreate = new Set<string>();

      if (curriculum) {
        selectedLevels.forEach(levelKey => {
          const levelData = curriculum.levels[levelKey as keyof typeof curriculum.levels];
          if (levelData) {
            levelData.forEach((cls: ClassLevel) => {
              classesToCreate.push({ name: cls.name, sections: [] });
              cls.subjects.forEach(sub => subjectsToCreate.add(sub.name));
            });
          }
        });
      }

      // 2. Backend کو Data بھیجیں
      // یہ API آپ کی Settings API ہوگی جو Classes اور Subjects سیٹ کرتی ہے
      await apiClient.post("/users/register-school", { 
        schoolName, 
        type: schoolType,
        curriculum: curriculumId,
        classes: classesToCreate,
        subjects: Array.from(subjectsToCreate)
      });

      // 3. Dashboard پر Redirect
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Failed to setup school. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-2xl w-full space-y-8">
        
        {/* Step 1: School Name & Type */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-black text-slate-800">Welcome to EduPilot</h1>
              <p className="text-gray-500 mt-2">Let's set up your school in just a few steps.</p>
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">School Name</label>
              <input
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-slate-900"
                placeholder="e.g. City Public School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">School Type</label>
              <div className="grid grid-cols-3 gap-4">
                {["Private", "Government", "Madrissa"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSchoolType(type as any)}
                    className={`p-4 rounded-xl border-2 font-bold transition ${schoolType === type ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!schoolName}
              className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Curriculum & Levels */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-black text-slate-800">Education System</h1>
              <p className="text-gray-500 mt-2">Select the curriculum and levels you offer.</p>
            </div>
            
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Curriculum / Board</label>
              <select 
                value={curriculumId} 
                onChange={(e) => setCurriculumId(e.target.value)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
              >
                <option value="federal">Federal Government (FBISE)</option>
                <option value="punjab">Punjab Government</option>
                <option value="wifaq">Wifaq-ul-Madaris</option>
                <option value="custom">Custom / Private Board</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Levels Offered</label>
              <div className="grid grid-cols-2 gap-4">
                {["primary", "elementary", "high", "madrissa"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevels(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level])}
                    className={`p-4 rounded-xl border-2 font-bold capitalize transition ${selectedLevels.includes(level) ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-200 text-gray-600'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-full bg-gray-200 text-gray-700 p-4 rounded-xl font-bold"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading || selectedLevels.length === 0}
                className="w-full bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle />}
                {loading ? "Configuring System..." : "Finish Setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
