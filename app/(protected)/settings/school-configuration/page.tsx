"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, History, Loader2, School, Settings2, ShieldAlert } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ToastProvider";

// 🟢 Note: Ensure CURRICULUMS is imported from your actual path
import { CURRICULUMS } from "@/lib/data/curriculums"; 

export default function EnterpriseSchoolConfigurationPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [editing, setEditing] = useState(false);
  
  // Form State
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState("Private");
  const [curriculumId, setCurriculumId] = useState("federal");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [editReason, setEditReason] = useState("");

  // 1. Fetch Active Configuration (React Query)
  const { data, isLoading } = useQuery({
    queryKey: ["schoolConfiguration"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/school-configuration");
      return res.data?.configuration; // MasterSchoolConfiguration
    }
  });

  // 2. Populate Form when Editing starts
  useEffect(() => {
    if (data && editing) {
      setSchoolName(data.school?.name || "");
      setSchoolType(data.school?.type || "Private");
      setCurriculumId(data.school?.curriculumId || "federal");
      setSelectedLevels(data.academic?.levels || []);
      setEditReason(""); // Reset reason for new edit
    }
  }, [data, editing]);

  // 3. Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (payloadData: any) => {
      return await apiClient.post("/settings/school-configuration", {
        action: "save_and_publish",
        reason: editReason || "Admin updated configuration",
        payload: payloadData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schoolConfiguration"] });
      showToast("School Configuration upgraded successfully! New version created.", "success");
      setEditing(false);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || "Failed to update configuration", "error");
    }
  });

  const handleSave = () => {
    // Generate Classes based on selected levels and curriculum
    const curriculum = CURRICULUMS.find(c => c.id === curriculumId);
    let generatedClasses: any[] = [];
    let generatedSubjects = new Set<string>();

    if (curriculum) {
      selectedLevels.forEach(levelKey => {
        const levelData = curriculum.levels[levelKey as keyof typeof curriculum.levels];
        if (levelData) {
          levelData.forEach((cls: any) => {
            generatedClasses.push({ id: cls.name.toLowerCase().replace(/\s/g, '-'), name: cls.name, level: levelKey });
            cls.subjects?.forEach((sub: any) => generatedSubjects.add(sub.name));
          });
        }
      });
    }

    // Build the Enterprise Payload
    const payload = {
      school: {
        name: schoolName,
        type: schoolType,
        curriculumId: curriculumId,
        country: "PK"
      },
      academic: {
        levels: selectedLevels,
        classes: generatedClasses,
        subjects: Array.from(generatedSubjects).map(name => ({ name, type: "Compulsory" })),
        defaultSections: data?.academic?.defaultSections || ["A"] // Keep existing or default
      }
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return <div className="flex h-72 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  const isConfigured = data?.state === "Published" || data?.state === "Locked";

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <School className="text-blue-600" /> School Configuration
            </h1>
            <p className="text-sm text-slate-500 mt-1">Single Source of Truth for your institution.</p>
          </div>
          {isConfigured && !editing && (
            <button 
              onClick={() => setEditing(true)} 
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold flex gap-2 items-center hover:bg-blue-700 transition"
            >
              <Settings2 size={17} /> Edit Configuration
            </button>
          )}
        </header>

        {isConfigured && !editing ? (
          // VIEW MODE
          <div className="grid md:grid-cols-3 gap-4">
            <SummaryCard title="School Profile" values={[data.school?.name, `${data.school?.type} School`, `Curriculum: ${data.school?.curriculumId}`]} />
            <SummaryCard title="Academic Structure" values={[`Levels: ${data.academic?.levels?.length || 0}`, `Classes: ${data.academic?.classes?.length || 0}`, `Subjects: ${data.academic?.subjects?.length || 0}`]} />
            <SummaryCard 
              title="Version Control" 
              values={[
                `State: ${data.state}`, 
                `Current Version: v${data.version?.number}`, 
                `Updated: ${new Date(data.version?.createdAt).toLocaleDateString()}`
              ]} 
              highlight={true}
            />
            
            {/* Version History Note */}
            <div className="md:col-span-3 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
               <ShieldAlert className="text-blue-600 mt-1" />
               <div>
                 <h2 className="font-bold text-blue-900">Enterprise Configuration Engine Active</h2>
                 <p className="text-sm text-blue-700 mt-1">
                   Editing this configuration will safely create Version {data.version?.number + 1}. All dependent modules (Fees, Attendance, Exams) will automatically sync to the new version without data loss.
                 </p>
               </div>
            </div>
          </div>
        ) : (
          // EDIT / SETUP MODE
          <div className="bg-white border shadow-sm rounded-2xl p-6 md:p-8 space-y-7">
            <section className="grid md:grid-cols-2 gap-5">
              <Field label="School Name">
                <input 
                  id="schoolName"
                  name="schoolName"
                  value={schoolName} 
                  onChange={(e) => setSchoolName(e.target.value)} 
                  className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
                  placeholder="e.g. City Public School" 
                />
              </Field>
              <Field label="School Type">
                <select 
                  id="schoolType"
                  name="schoolType"
                  value={schoolType} 
                  onChange={(e) => setSchoolType(e.target.value)} 
                  className="w-full p-3 border rounded-lg outline-none focus:border-blue-500"
                >
                  <option value="Private">Private</option>
                  <option value="Government">Government</option>
                  <option value="Madrissa">Madrissa</option>
                </select>
              </Field>
              <Field label="Curriculum / Board">
                <select 
                  id="curriculumId"
                  name="curriculumId"
                  value={curriculumId} 
                  onChange={(e) => setCurriculumId(e.target.value)} 
                  className="w-full p-3 border rounded-lg outline-none focus:border-blue-500"
                >
                  {CURRICULUMS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Reason for Edit (Audit Log)">
                <input 
                  id="editReason"
                  name="editReason"
                  value={editReason} 
                  onChange={(e) => setEditReason(e.target.value)} 
                  className="w-full p-3 border rounded-lg outline-none focus:border-blue-500" 
                  placeholder="e.g. Added Higher Secondary Classes" 
                  required 
                />
              </Field>
            </section>

            <section>
              <h2 className="font-bold text-slate-800 mb-3">Academic Levels Offered</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {["early_childhood", "primary", "middle", "secondary", "higher_secondary", "madrissa"].map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setSelectedLevels((prev) => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level])}
                    className={`p-4 rounded-xl border-2 text-left font-semibold capitalize transition ${
                      selectedLevels.includes(level) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {level.replace("_", " ")}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {isConfigured && (
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">
                  Cancel
                </button>
              )}
              <button 
                type="button" 
                onClick={handleSave} 
                disabled={saveMutation.isPending || !schoolName.trim() || selectedLevels.length === 0 || (isConfigured && !editReason.trim())} 
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-green-700 transition shadow-sm"
              >
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} 
                {isConfigured ? "Save & Upgrade Version" : "Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { 
  return <label className="block text-sm font-bold text-slate-700 space-y-1">{label}{children}</label>; 
}

function SummaryCard({ title, values, highlight = false }: { title: string; values: string[], highlight?: boolean }) { 
  return (
    <section className={`border rounded-2xl p-5 ${highlight ? 'bg-slate-900 text-white' : 'bg-white'}`}>
      <h2 className={`font-bold ${highlight ? 'text-blue-400' : 'text-slate-800'}`}>{title}</h2>
      <div className={`mt-3 space-y-2 text-sm ${highlight ? 'text-slate-300' : 'text-slate-600'}`}>
        {values.map((value, i) => <p key={i} className="font-medium">{value}</p>)}
      </div>
    </section>
  ); 
}
