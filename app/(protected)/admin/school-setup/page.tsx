cat > "app/(protected)/admin/school-setup/page.tsx" << 'EOF'
"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, History, Loader2, School, Settings2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { CURRICULUMS } from "@/lib/curriculum-data";
import { useSaveSchoolConfiguration } from "@/hooks/useSchoolConfiguration";
import { useConfiguration } from "@/app/(protected)/providers/ConfigurationProvider";
import type { SchoolType } from "@/types/school-configuration";

const levels = [
  ["early_childhood", "Early Childhood"], ["primary", "Primary"], ["middle", "Middle"],
  ["secondary", "Secondary"], ["higher_secondary", "Higher Secondary"], ["madrissa", "Madrissa"],
] as const;

export default function SchoolConfigurationPage() {
  const { config: configuration, history, isLoading } = useConfiguration();
  const save = useSaveSchoolConfiguration();
  
  const [editing, setEditing] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState<SchoolType>("Private");
  const [curriculumId, setCurriculumId] = useState("federal");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [sections, setSections] = useState("A");

  useEffect(() => {
    if (!configuration) return;
    setSchoolName(configuration.school?.name || "");
    setSchoolType(configuration.school?.type || "Private");
    setCurriculumId(configuration.school?.curriculumId || "federal");
    setSelectedLevels(configuration.academic?.levels || []);
    setSections((configuration.academic?.sectionNames || ["A"]).join(", "));
  }, [configuration]);

  const curriculums = useMemo(() => CURRICULUMS.filter((curriculum) => {
    if (schoolType === "Government") return ["federal", "punjab"].includes(curriculum.id);
    if (schoolType === "Madrissa") return curriculum.id === "wifaq";
    return curriculum.id !== "wifaq";
  }), [schoolType]);
  
  const supportedLevels = useMemo(() => new Set(Object.keys(CURRICULUMS.find((item) => item.id === curriculumId)?.levels || {})), [curriculumId]);
  const configured = configuration?.state === "Published";

  const setType = (nextType: SchoolType) => {
    setSchoolType(nextType);
    const next = CURRICULUMS.find((item) => nextType === "Madrissa" ? item.id === "wifaq" : nextType === "Government" ? ["federal", "punjab"].includes(item.id) : item.id !== "wifaq");
    if (next) setCurriculumId(next.id);
    setSelectedLevels([]);
  };
  
  const submit = () => save.mutate({ schoolName, schoolType, curriculumId, levels: selectedLevels, sectionNames: sections.split(",").map((item) => item.trim()).filter(Boolean) });

  if (isLoading) return <div className="flex h-72 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  
  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <School className="text-blue-600" /> {configured ? "School Configuration" : "Complete School Setup"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Your permanent, tenant-scoped academic configuration.</p>
          </div>
          {configured && !editing && (
            <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold flex gap-2 items-center">
              <Settings2 size={17} /> Edit Configuration
            </button>
          )}
        </header>

        {configured && !editing ? (
          <div className="grid md:grid-cols-3 gap-4">
            <Summary title="School Profile" values={[configuration?.school?.name || "N/A", configuration?.school?.type || "N/A", configuration?.school?.boardName || "N/A"]} />
            <Summary title="Academic Structure" values={[`${configuration?.academic?.classes?.length || 0} classes`, `${configuration?.academic?.sectionNames?.length || 0} section template(s)`, `${configuration?.academic?.subjects?.length || 0} subjects`]} />
            
            <Summary 
              title="Configuration Status" 
              values={[
                configuration?.state || "Draft", 
                `Version ${configuration?.version?.number || 1}`, 
                configuration?.version?.publishedAt 
                  ? `Completed ${new Date(configuration.version.publishedAt).toLocaleDateString()}` 
                  : "Migrated configuration"
              ]} 
            />
            
            <div className="md:col-span-3 bg-white border rounded-2xl p-6">
              <h2 className="font-bold flex gap-2 items-center"><History size={18} /> Configuration History</h2>
              <div className="mt-3 text-sm text-slate-600">
                {history.length ? history.map((item, index) => (
                  <p key={item?.id || index}>
                    Version {item?.version?.number || "Unknown"}: {item?.version?.reason || "Updated"}.
                  </p>
                )) : "No configuration changes have been recorded yet."}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border shadow-sm rounded-2xl p-6 md:p-8 space-y-7">
            <section className="grid md:grid-cols-2 gap-5">
              <Field label="School name"><input value={schoolName} onChange={(event) => setSchoolName(event.target.value)} className="field" placeholder="School name" /></Field>
              <Field label="School type">
                <select value={schoolType} onChange={(event) => setType(event.target.value as SchoolType)} className="field">
                  {["Private", "Government", "Madrissa"].map((type) => <option key={type}>{type}</option>)}
                </select>
              </Field>
              <Field label="Education board / curriculum">
                <select value={curriculumId} onChange={(event) => { setCurriculumId(event.target.value); setSelectedLevels([]); }} className="field">
                  {curriculums.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </Field>
              <Field label="Default sections">
                <input value={sections} onChange={(event) => setSections(event.target.value)} className="field" placeholder="A, B, C" />
                <p className="text-xs text-slate-500 mt-1">Comma-separated; existing sections are never removed automatically.</p>
              </Field>
            </section>
            <section>
              <h2 className="font-bold text-slate-800">Academic levels offered</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {levels.filter(([key]) => supportedLevels.has(key)).map(([key, label]) => (
                  <button 
                    type="button" 
                    key={key} 
                    onClick={() => setSelectedLevels((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} 
                    className={`p-4 rounded-xl border-2 text-left font-semibold ${selectedLevels.includes(key) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </section>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(false)} className="px-4 py-3 font-bold text-slate-600">Cancel</button>
              <button 
                type="button" 
                onClick={submit} 
                disabled={save.isPending || !schoolName.trim() || !selectedLevels.length} 
                className="bg-green-600 text-white px-5 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {save.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} 
                {configured ? "Save Configuration" : "Complete Setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { 
  return <label className="block text-sm font-bold text-slate-700">{label}{children}</label>; 
}

function Summary({ title, values }: { title: string; values: string[] }) { 
  return (
    <section className="bg-white border rounded-2xl p-5">
      <h2 className="font-bold text-slate-800">{title}</h2>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        {values.map((value) => <p key={value}>{value}</p>)}
      </div>
    </section>
  ); 
}
EOF
