"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; 
import { 
  CheckCircle2, Loader2, School, Settings2, 
  Building2, GraduationCap, Layers 
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ToastProvider";

const CURRICULUMS = [
  { id: "punjab_snc", name: "Punjab Single National Curriculum (SNC)" },
  { id: "oxford", name: "Oxford / Private Systems" },
  { id: "federal", name: "Federal Government (FBISE)" },
  { id: "wifaq", name: "Wifaq-ul-Madaris Al-Arabia" }
];

type TabType = "profile" | "classes" | "sections";

export default function EnterpriseSchoolConfigurationPage() {
  const queryClient = useQueryClient();
  const router = useRouter(); 
  const { showToast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  // DTO States (Only UI Inputs)
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState<"Private" | "Government" | "Madrissa">("Private");
  const [curriculumId, setCurriculumId] = useState("punjab_snc");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  
  const [sectionNames, setSectionNames] = useState<string[]>(["A"]);
  const [newSectionInput, setNewSectionInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["schoolConfiguration"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/school-configuration");
      return res.data?.configuration; 
    }
  });

  // 🟢 Source of truth uses status: "configured"
  const isConfigured = data?.status === "configured";

  useEffect(() => {
    if (data && editing) {
      setSchoolName(data.school?.name || "");
      setSchoolType(data.school?.type || "Private");
      setCurriculumId(data.school?.curriculumId || "punjab_snc");
      
      // 🟢 Using academicStructure as instructed
      setSelectedLevels(data.academicStructure?.levels || []);
      setSectionNames(data.academicStructure?.sectionNames || ["A"]);
    }
  }, [data, editing]);

  const saveMutation = useMutation({
    mutationFn: async (payloadData: any) => {
      // 🟢 Directly hitting the unified endpoint with PUT
      return await apiClient.put("/settings/school-configuration", payloadData);
    },
    onSuccess: () => {
      showToast("System Configured! Enterprise SAAS Modules are now unlocked.", "success");
      
      // 🟢 Safe React Query Cache Invalidation (No window.location.reload)
      queryClient.invalidateQueries({ queryKey: ["schoolConfiguration"] });
      
      // 🟢 Background Server Refresh
      router.refresh(); 

      setEditing(false);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || "Failed to synchronize configuration", "error");
    }
  });

  const handleSave = () => {
    if (!schoolName.trim()) return showToast("School Name is required.", "error");
    if (selectedLevels.length === 0) return showToast("Please select at least one Academic Level.", "error");

    // 🟢 Pure UI DTO: No status, state, action, or academicStructure generation here.
    const payload = {
      schoolName,
      schoolType,
      curriculumId,
      levels: selectedLevels,
      sectionNames
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-bold">Checking Enterprise Kernel State...</p>
      </div>
    );
  }

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Enterprise SaaS Configuration</h1>
              <p className="text-sm text-slate-500 mt-0.5">Global Master Sync Engine (SSOT)</p>
            </div>
          </div>
          {isConfigured && !editing && (
            <button 
              onClick={() => setEditing(true)} 
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex gap-2 items-center hover:bg-blue-700 transition shadow-sm"
            >
              <Settings2 size={17} /> Edit & Re-Sync SAAS
            </button>
          )}
        </header>

        {isConfigured && !editing ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-3 gap-5">
              <SummaryCard title="School Profile" icon={<Building2 size={18} />} values={[data.school?.name, `${data.school?.type} School`, `Syllabus System: ${data.school?.curriculumId}`]} />
              <SummaryCard title="Academic Setup" icon={<GraduationCap size={18} />} values={[`Levels Offered: ${data.academicStructure?.levels?.length || 0}`, `Active Classes: ${data.academicStructure?.classes?.length || 0}`, `Sections Configured: ${data.academicStructure?.sectionNames?.length || 0}`]} />
              <SummaryCard 
                title="Global Sync Status" 
                icon={<Layers size={18} />}
                values={[
                  `Status: ${data.status}`, 
                  `Configuration Version: v${data.version || 1}`, 
                  `Updated: ${data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : 'N/A'}`
                ]} 
                highlight={true}
              />
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-start gap-4">
              <CheckCircle2 className="text-green-600 mt-1 shrink-0" />
              <div>
                <h2 className="font-bold text-green-900">SaaS Ecosystem is Fully Interlinked!</h2>
                <p className="text-sm text-green-700 mt-1">
                  آپ کا اسکول کامیابی کے ساتھ رجسٹر ہو چکا ہے۔ آپ کا منتخب کردہ سلیبس اب Admissions، Attendance اور Exams میں استعمال کے لیے تیار ہے۔ تمام فیچرز ان لاک ہو چکے ہیں۔
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
              <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} label="1. SAAS Base Setup" icon={<Building2 size={16} />} />
              <TabButton active={activeTab === "classes"} onClick={() => setActiveTab("classes")} label="2. Classes & Levels" icon={<GraduationCap size={16} />} />
              <TabButton active={activeTab === "sections"} onClick={() => setActiveTab("sections")} label="3. Sections Config" icon={<Layers size={16} />} />
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              {/* TAB 1 */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Field label="School Name *">
                      <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. The Educators" />
                    </Field>
                    <Field label="School Type">
                      <select value={schoolType} onChange={(e) => setSchoolType(e.target.value as any)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition">
                        <option value="Private">Private / Trust</option>
                        <option value="Government">Government / Public</option>
                        <option value="Madrissa">Madrissa / Islamic Center</option>
                      </select>
                    </Field>
                    <Field label="Syllabus / Region / System *">
                      <select value={curriculumId} onChange={(e) => setCurriculumId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition">
                        {CURRICULUMS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              )}

              {/* TAB 2 */}
              {activeTab === "classes" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                    <p className="text-sm text-blue-800 font-bold">
                      لیول (Level) منتخب کریں۔ سسٹم خودکار طور پر بیک اینڈ سروس کے ذریعے کلاسز اور مضامین جنریٹ کر لے گا۔
                    </p>
                  </div>
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
                </div>
              )}

              {/* TAB 3 */}
              {activeTab === "sections" && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-slate-800">Global Section Identifiers</h3>
                    <div className="flex gap-2 max-w-md">
                      <input type="text" value={newSectionInput} onChange={(e) => setNewSectionInput(e.target.value.toUpperCase())} placeholder="e.g. C" className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                      <button type="button" onClick={() => {
                          if (newSectionInput.trim() && !sectionNames.includes(newSectionInput)) {
                            setSectionNames([...sectionNames, newSectionInput.trim()]);
                            setNewSectionInput("");
                          }
                        }} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">Add Section</button>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {sectionNames.map((sec) => (
                        <span key={sec} className="bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border font-bold text-sm flex items-center gap-2">
                          Section {sec}
                          <button type="button" onClick={() => setSectionNames(sectionNames.filter(s => s !== sec))} className="text-slate-400 hover:text-red-500 font-bold">&times;</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              {isConfigured && <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition">Cancel</button>}
              <button type="button" onClick={handleSave} disabled={saveMutation.isPending || !schoolName.trim() || selectedLevels.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50">
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} 
                {saveMutation.isPending ? "Syncing SAAS Globally..." : isConfigured ? "Save Configuration" : "Initialize SSOT Engine"}
              </button>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${active ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"}`}>
      {icon} {label}
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-bold text-slate-700 space-y-2">{label}{children}</label>; }
function SummaryCard({ title, icon, values, highlight = false }: { title: string; icon: React.ReactNode, values: string[], highlight?: boolean }) { 
  return (
    <section className={`border rounded-2xl p-6 ${highlight ? 'bg-slate-900 text-white' : 'bg-white border-slate-100 shadow-sm'}`}>
      <h2 className={`font-bold flex items-center gap-2 ${highlight ? 'text-blue-400' : 'text-slate-800'}`}>{icon} {title}</h2>
      <div className={`mt-4 space-y-2 text-sm ${highlight ? 'text-slate-300' : 'text-slate-600'}`}>{values.map((value, i) => <p key={i} className="font-semibold">{value}</p>)}</div>
    </section>
  ); 
}
