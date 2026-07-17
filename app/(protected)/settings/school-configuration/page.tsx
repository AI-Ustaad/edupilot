"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  CheckCircle2, Loader2, School, Settings2, ShieldAlert, 
  Building2, GraduationCap, BookOpen, Layers, Plus, Trash2, Globe 
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ToastProvider";

// 🟢 Enterprise Syllabus Database (Regions & Private Systems)
const CURRICULUMS = [
  {
    id: "punjab",
    name: "Punjab Syllabus (Region)",
    levels: {
      primary: [
        { name: "Class 1", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Knowledge", type: "Compulsory" }] },
        { name: "Class 5", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Science", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] }
      ],
      middle: [
        { name: "Class 8", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Mathematics", type: "Compulsory" }, { name: "General Science", type: "Compulsory" }, { name: "Computer Science", type: "Compulsory" }] }
      ],
      secondary: [
        { name: "Class 9 (Science)", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }, { name: "Biology", type: "Optional" }, { name: "Computer Science", type: "Optional" }, { name: "Islamiyat", type: "Compulsory" }] },
        { name: "Class 10 (Science)", subjects: [{ name: "English", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }, { name: "Biology", type: "Optional" }, { name: "Computer Science", type: "Optional" }, { name: "Pakistan Studies", type: "Compulsory" }] }
      ]
    }
  },
  {
    id: "oxford",
    name: "Oxford Syllabus (Private School)",
    levels: {
      early_childhood: [
        { name: "Nursery", subjects: [{ name: "English Phonics", type: "Compulsory" }, { name: "Numbers", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Art & Craft", type: "Compulsory" }] },
        { name: "Prep", subjects: [{ name: "Oxford English", type: "Compulsory" }, { name: "New Countdown", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "General Knowledge", type: "Compulsory" }] }
      ],
      primary: [
        { name: "Class 1", subjects: [{ name: "Oxford English", type: "Compulsory" }, { name: "New Countdown", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Amazing Science", type: "Compulsory" }, { name: "Oxford Social Studies", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }, { name: "Computer", type: "Optional" }] },
        { name: "Class 5", subjects: [{ name: "Oxford English", type: "Compulsory" }, { name: "New Countdown", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Amazing Science", type: "Compulsory" }, { name: "Oxford Social Studies", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }, { name: "Keyboard (Computer)", type: "Compulsory" }] }
      ],
      middle: [
        { name: "Class 8", subjects: [{ name: "Oxford English", type: "Compulsory" }, { name: "New Countdown", type: "Compulsory" }, { name: "Urdu", type: "Compulsory" }, { name: "Amazing Science", type: "Compulsory" }, { name: "History & Geography", type: "Compulsory" }, { name: "Computer Science", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }] }
      ]
    }
  },
  {
    id: "afaq",
    name: "AFAQ Sun Series (Private School)",
    levels: {
      early_childhood: [
        { name: "Playgroup", subjects: [{ name: "AFAQ English", type: "Compulsory" }, { name: "AFAQ Math", type: "Compulsory" }, { name: "AFAQ Urdu", type: "Compulsory" }, { name: "Rhymes", type: "Compulsory" }] }
      ],
      primary: [
        { name: "Class 1", subjects: [{ name: "AFAQ English", type: "Compulsory" }, { name: "AFAQ Math", type: "Compulsory" }, { name: "AFAQ Urdu", type: "Compulsory" }, { name: "AFAQ Science", type: "Compulsory" }, { name: "Islamiyat", type: "Compulsory" }, { name: "Tarbiyat", type: "Compulsory" }] }
      ]
    }
  },
  {
    id: "federal",
    name: "Federal Government (FBISE)",
    levels: {
      secondary: [
        { name: "Class 9", subjects: [{ name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }, { name: "Biology", type: "Optional" }] },
        { name: "Class 10", subjects: [{ name: "Physics", type: "Compulsory" }, { name: "Chemistry", type: "Compulsory" }, { name: "Computer Science", type: "Optional" }] }
      ]
    }
  }
];

type TabType = "profile" | "classes" | "subjects" | "sections";

export default function EnterpriseSchoolConfigurationPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  
  // SSOT State
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState<"Private" | "Government" | "Madrissa">("Private");
  const [curriculumId, setCurriculumId] = useState("punjab");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [editReason, setEditReason] = useState("");
  
  const [configuredClasses, setConfiguredClasses] = useState<any[]>([]);
  const [sectionNames, setSectionNames] = useState<string[]>(["A", "B"]);
  const [newSectionInput, setNewSectionInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["schoolConfiguration"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/school-configuration");
      return res.data?.configuration; 
    }
  });

  useEffect(() => {
    if (data && editing) {
      setSchoolName(data.school?.name || "");
      setSchoolType(data.school?.type || "Private");
      setCurriculumId(data.school?.curriculumId || "punjab");
      setSelectedLevels(data.academic?.levels || []);
      
      if (data.academic?.classes) setConfiguredClasses(data.academic.classes);
      if (data.academic?.defaultSections) setSectionNames(data.academic.defaultSections);
      setEditReason("");
    }
  }, [data, editing]);

  // 🚀 MAGIC: Auto-Generate Subjects and Classes instantly when Level/Syllabus changes
  useEffect(() => {
    if (!editing && (data?.state === "Published" || data?.state === "Locked")) return; // Don't override if merely viewing

    const selectedCurriculum = CURRICULUMS.find(c => c.id === curriculumId);
    if (!selectedCurriculum) return;

    let autoGenerated: any[] = [];
    selectedLevels.forEach(levelKey => {
      const levelClasses = selectedCurriculum.levels[levelKey as keyof typeof selectedCurriculum.levels] as any[];
      if (levelClasses) {
        levelClasses.forEach((cls) => {
          autoGenerated.push({
            name: cls.name,
            level: levelKey,
            subjects: JSON.parse(JSON.stringify(cls.subjects || [])) // Deep clone to avoid referencing issues
          });
        });
      }
    });

    // Merge logic: Preserve custom changes if class already exists, otherwise add new
    setConfiguredClasses(prevClasses => {
      if (prevClasses.length === 0) return autoGenerated;
      
      const merged = autoGenerated.map(newCls => {
        const existing = prevClasses.find(p => p.name === newCls.name);
        return existing ? existing : newCls;
      });
      return merged;
    });
  }, [selectedLevels, curriculumId, editing, data?.state]);

  const saveMutation = useMutation({
    mutationFn: async (payloadData: any) => {
      return await apiClient.post("/settings/school-configuration", {
        action: "save_and_publish",
        reason: editReason || "Automated sync of Syllabus & Subjects across SaaS",
        payload: payloadData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schoolConfiguration"] });
      showToast("Global Sync Complete: Settings applied to Admissions, Fees, Exams & AI!", "success");
      setEditing(false);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.error || "Failed to synchronize configuration", "error");
    }
  });

  const handleSave = () => {
    if (!schoolName.trim()) return showToast("School Name is required.", "error");
    if (selectedLevels.length === 0) return showToast("Please select at least one Academic Level.", "error");

    const payload = {
      school: {
        name: schoolName,
        type: schoolType,
        curriculumId: curriculumId,
        country: "PK"
      },
      academic: {
        levels: selectedLevels,
        classes: configuredClasses,
        subjects: Array.from(new Set(configuredClasses.flatMap(c => c.subjects.map((s: any) => s.name)))),
        defaultSections: sectionNames
      }
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-bold">Synchronizing SaaS Modules...</p>
      </div>
    );
  }

  const isConfigured = data?.state === "Published" || data?.state === "Locked";

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
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-5">
              <SummaryCard title="School Profile" icon={<Building2 size={18} />} values={[data.school?.name, `${data.school?.type} School`, `Syllabus System: ${data.school?.curriculumId}`]} />
              <SummaryCard title="Academic Setup" icon={<GraduationCap size={18} />} values={[`Levels Offered: ${data.academic?.levels?.length || 0}`, `Active Classes: ${data.academic?.classes?.length || 0}`, `Default Sections: ${data.academic?.defaultSections?.join(", ") || "A"}`]} />
              <SummaryCard 
                title="Global Sync Status" 
                icon={<Layers size={18} />}
                values={[
                  `App Status: Fully Synced`, 
                  `Configuration Version: v${data.version?.number}`, 
                  `Updated: ${new Date(data.version?.createdAt).toLocaleDateString()}`
                ]} 
                highlight={true}
              />
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-start gap-4">
              <CheckCircle2 className="text-green-600 mt-1 shrink-0" />
              <div>
                <h2 className="font-bold text-green-900">SaaS Ecosystem is Fully Interlinked!</h2>
                <p className="text-sm text-green-700 mt-1">
                  آپ کا منتخب کردہ سلیبس (Syllabus/System) کامیابی سے Admissions، Attendance، Exams اور Finance کے تمام ماڈیولز میں خودکار طریقے سے اپڈیٹ اور لنک کر دیا گیا ہے۔
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-1 overflow-x-auto">
              <TabButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} label="1. SAAS Base Setup" icon={<Building2 size={16} />} />
              <TabButton active={activeTab === "classes"} onClick={() => setActiveTab("classes")} label="2. Classes & Levels" icon={<GraduationCap size={16} />} />
              <TabButton active={activeTab === "subjects"} onClick={() => setActiveTab("subjects")} label="3. Auto-Generated Subjects" icon={<BookOpen size={16} />} />
              <TabButton active={activeTab === "sections"} onClick={() => setActiveTab("sections")} label="4. Global Sync" icon={<Layers size={16} />} />
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
                      لیول (Level) منتخب کریں، کلاسز اور مضامین خودکار طور پر جنریٹ ہو جائیں گے!
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

                  {configuredClasses.length > 0 && (
                    <div className="border border-slate-100 rounded-xl overflow-hidden mt-6">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b">
                          <tr><th className="p-3 text-left">Auto-Generated Class</th><th className="p-3 text-left">Level</th><th className="p-3 text-right">Subjects Synced</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {configuredClasses.map((cls, idx) => (
                            <tr key={idx}>
                              <td className="p-3 font-semibold text-slate-800">{cls.name}</td>
                              <td className="p-3 capitalize text-slate-500">{cls.level.replace("_", " ")}</td>
                              <td className="p-3 text-right font-bold text-green-600">{cls.subjects?.length || 0} Auto-Mapped</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3 */}
              {activeTab === "subjects" && (
                <div className="space-y-6">
                  <h3 className="font-bold text-slate-800">Review Auto-Generated Syllabus</h3>
                  <div className="space-y-4">
                    {configuredClasses.length === 0 && <p className="text-slate-500">Please select an Academic Level from Tab 2 first.</p>}
                    {configuredClasses.map((cls, classIdx) => (
                      <div key={classIdx} className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-slate-800">{cls.name} <span className="text-xs text-slate-400 capitalize">({cls.level})</span></span>
                          <button 
                            type="button" 
                            onClick={() => {
                              const subName = prompt("Add Custom Subject to Syllabus:");
                              if (subName) {
                                const updated = [...configuredClasses];
                                updated[classIdx].subjects.push({ name: subName, type: "Compulsory" });
                                setConfiguredClasses(updated);
                              }
                            }}
                            className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition flex items-center gap-1"
                          >
                            <Plus size={12} /> Custom Subject
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cls.subjects.map((sub: any, subIdx: number) => (
                            <div key={subIdx} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs">
                              <span className="font-semibold text-slate-700">{sub.name}</span>
                              <select 
                                value={sub.type}
                                onChange={(e) => {
                                  const updated = [...configuredClasses];
                                  updated[classIdx].subjects[subIdx].type = e.target.value;
                                  setConfiguredClasses(updated);
                                }}
                                className="bg-slate-50 border-none font-bold text-blue-600 focus:ring-0 cursor-pointer text-[10px] p-0"
                              >
                                <option value="Compulsory">Compulsory</option>
                                <option value="Optional">Optional</option>
                                <option value="Practical">Practical</option>
                              </select>
                              <button type="button" onClick={() => {
                                  const updated = [...configuredClasses];
                                  updated[classIdx].subjects = updated[classIdx].subjects.filter((_: any, i: number) => i !== subIdx);
                                  setConfiguredClasses(updated);
                                }} className="text-slate-400 hover:text-red-500">&times;</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4 */}
              {activeTab === "sections" && (
                <div className="space-y-6">
                  <Field label="Synchronization Log Note (Required) *">
                    <input type="text" value={editReason} onChange={(e) => setEditReason(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="e.g. Re-mapped Oxford Syllabus for Primary Level" required />
                    <p className="text-xs text-slate-400 mt-1">This log will be attached to all modules (Fees, Attendance) that get synced by this action.</p>
                  </Field>
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
              <button type="button" onClick={handleSave} disabled={saveMutation.isPending || !schoolName.trim() || selectedLevels.length === 0 || (isConfigured && !editReason.trim())} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50">
                {saveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} 
                {saveMutation.isPending ? "Syncing SAAS Globally..." : isConfigured ? "Publish & Sync Data" : "Initialize SSOT Engine"}
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
