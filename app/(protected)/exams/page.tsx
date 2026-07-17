/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PenTool, Save, CheckCircle2, AlertCircle, Users, BookOpen, Trash2, Database, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import type { Mark } from "@/types/marks";

const EXAM_TERMS = ["1st Term", "2nd Term", "Final Exams", "Monthly Test", "Mock Exams", "SBA"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

interface StudentRecord { id: string; classGrade?: string; section?: string; rollNumber?: number; fullName?: string; name?: string; fatherName?: string; photoBase64?: string; }
interface ClassSection { id: string; classGrade?: string; name?: string; sectionName?: string; section?: string; subjects?: { core?: string[]; electives?: string[] }; }

const fetchStudents = async (): Promise<StudentRecord[]> => { const res = await apiClient.get("/students") as any; return res?.data || res || []; };
const fetchSections = async (): Promise<ClassSection[]> => { const res = await apiClient.get("/classes") as any; return res?.data || res || []; };
const fetchMarks = async (p: { classGrade: string; section: string; term: string; subject: string }): Promise<(Mark & { id: string })[]> => { const res = await apiClient.get(`/marks?${new URLSearchParams(Object.entries(p).filter(([,v]) => v))}`) as any; return res?.data || []; };
const saveMarkApi = async (d: Record<string, unknown>) => { return (await apiClient.post("/marks", d)) as any; };
const deleteMarkApi = async (id: string) => { return (await apiClient.delete(`/marks?id=${id}`)) as any; };

export default function ExamsAndMarksPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [term, setTerm] = useState(EXAM_TERMS[0]);
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [sub, setSub] = useState("");
  const [defTotal, setDefTotal] = useState("100");
  const [entry, setEntry] = useState<Record<string, { obtained: string; total: string }>>({});
  const [savingRow, setSavingRow] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const { data: students = [], isLoading: ls } = useQuery({ queryKey: ["students", user?.tenantId], queryFn: fetchStudents, enabled: !!user?.tenantId });
  const { data: sections = [], isLoading: lsec } = useQuery({ queryKey: ["sections", user?.tenantId], queryFn: fetchSections, enabled: !!user?.tenantId });
  const { data: marks = [], isLoading: lm } = useQuery({ queryKey: ["marks", user?.tenantId, cls, sec, term, sub], queryFn: () => fetchMarks({ classGrade: cls, section: sec, term, subject: sub }), enabled: !!user?.tenantId && !!cls && !!sec && !!sub });

  useEffect(() => { setEntry({}); }, [term, cls, sec, sub]);

  const saveMut = useMutation({ mutationFn: saveMarkApi, onSuccess: () => { qc.invalidateQueries({ queryKey: ["marks", user?.tenantId, cls, sec, term, sub] }); setOk(true); setTimeout(() => setOk(false), 3000); }, onError: () => setErr("Failed to save mark.") });
  const delMut = useMutation({ mutationFn: deleteMarkApi, onSuccess: () => { qc.invalidateQueries({ queryKey: ["marks", user?.tenantId, cls, sec, term, sub] }); }, onError: () => setErr("Failed to delete mark.") });

  const classes = Array.from(new Set(sections.map(s => s.classGrade || s.name || "")));
  const secs = sections.filter(s => norm(s.classGrade || s.name) === norm(cls));
  const active = sections.find(s => norm(s.classGrade || s.name) === norm(cls) && norm(s.sectionName || s.section) === norm(sec));
  const subs = active?.subjects ? [...(active.subjects.core || []), ...(active.subjects.electives || [])] : [];
  const filtered = students.filter(s => norm(s.classGrade) === norm(cls) && norm(s.section) === norm(sec));

  const grade = (o: number, t: number) => { if (!t || !o) return "-"; const p = (o / t) * 100; if (p >= 90) return "A++"; if (p >= 80) return "A+"; if (p >= 70) return "A"; if (p >= 60) return "B"; if (p >= 50) return "C"; if (p >= 40) return "D"; return "U"; };

  const getVal = (sid: string, f: "obtained" | "total") => {
    if (entry[sid]?.[f] !== undefined) return entry[sid][f];
    const ex = marks.find(m => m.studentId === sid && norm(m.term) === norm(term) && norm(m.subject) === norm(sub));
    if (ex) return f === "obtained" ? ex.marksObtained.toString() : ex.totalMarks.toString();
    return f === "obtained" ? "" : defTotal;
  };

  const onChange = (sid: string, f: "obtained" | "total", v: string) => { setEntry(p => ({ ...p, [sid]: { ...p[sid], [f]: v, total: f === "total" ? v : (p[sid]?.total || getVal(sid, "total")) } })); };

  const doSave = async (s: StudentRecord) => {
    setSavingRow(s.id); setErr("");
    try { const o = Number(getVal(s.id, "obtained")), t = Number(getVal(s.id, "total")); const pct = t > 0 ? ((o / t) * 100).toFixed(1) : "0"; await saveMut.mutateAsync({ studentId: s.id, studentName: s.fullName || s.name, classGrade: cls, section: sec, term, subject: sub, marksObtained: o, totalMarks: t, percentage: Number(pct), grade: grade(o, t) }); } finally { setSavingRow(null); }
  };

  const doBulk = async () => {
    if (!cls || !sec || !sub) return setErr("Select Class, Section, and Subject.");
    setErr("");
    try { await Promise.all(filtered.map(s => { const o = Number(getVal(s.id, "obtained")), t = Number(getVal(s.id, "total")); const pct = t > 0 ? ((o / t) * 100).toFixed(1) : "0"; return saveMut.mutateAsync({ studentId: s.id, studentName: s.fullName || s.name, classGrade: cls, section: sec, term, subject: sub, marksObtained: o, totalMarks: t, percentage: Number(pct), grade: grade(o, t) }); })); setOk(true); setTimeout(() => setOk(false), 3000); } catch { setErr("Failed to bulk save marks."); }
  };

  const loading = ls || lsec || (lm && !!cls);

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div><h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3"><PenTool className="text-[#3ac47d]"/> Exams & Marks Entry</h1><p className="text-sm text-slate-500 mt-1">Smart Assessment Engine linked directly to Results Module.</p></div>
        <RequirePermission permissions={[PERMISSIONS.exams.manage]}><button onClick={doBulk} disabled={loading || filtered.length === 0 || !sub || saveMut.isPending} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-slate-800 transition-all disabled:opacity-50">{saveMut.isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} {saveMut.isPending ? "Publishing..." : "Publish All Results"}</button></RequirePermission>
      </div>
      {ok && <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold"><CheckCircle2 size={20}/> Marks saved successfully!</div>}
      {err && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100 font-bold"><AlertCircle size={20}/> {err}</div>}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-wrap lg:flex-nowrap gap-4 items-end z-10 relative">
        {[{ label: "Exam Term", val: term, set: setTerm, opts: EXAM_TERMS.map(t => ({ v: t, l: t })), dis: false }, { label: "Select Class", val: cls, set: (v: string) => { setCls(v); setSec(""); setSub(""); }, opts: [{ v: "", l: "-- Choose --" }, ...classes.map(c => ({ v: c, l: c }))], dis: false }, { label: "Select Section", val: sec, set: setSec, opts: [{ v: "", l: "-- Choose --" }, ...secs.map(s => ({ v: s.sectionName || s.section || "", l: s.sectionName || s.section || "" }))], dis: !cls }, { label: "Select Subject", val: sub, set: setSub, opts: [{ v: "", l: "-- Choose --" }, ...subs.map(s => ({ v: s, l: s }))], dis: !sec }].map((f, i) => (
          <div key={i} className="w-full lg:w-1/5 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.label}</label><select value={f.val} onChange={e => typeof f.set === "function" && f.set(e.target.value)} disabled={f.dis} className={`w-full ${i === 3 ? 'bg-[#f0fdf4] border-green-200 text-green-700' : 'bg-slate-50'} outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] disabled:opacity-50`}>{f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select></div>
        ))}
        <div className="w-full lg:w-1/5 space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Default Total Marks</label><input type="number" value={defTotal} onChange={e => setDefTotal(e.target.value)} className="w-full bg-slate-50 outline-none rounded-xl px-4 py-3 text-sm border font-bold text-[#0F172A] text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /></div>
      </div>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        {loading ? <div className="h-[300px] flex flex-col items-center justify-center opacity-40"><Loader2 size={40} className="mb-4 text-slate-400 animate-spin" /><h3 className="text-xl font-black text-slate-600">Loading Data...</h3></div>
        : (!cls || !sec || !sub) ? <div className="h-[300px] flex flex-col items-center justify-center opacity-40"><BookOpen size={60} className="mb-4 text-slate-400" /><h3 className="text-xl font-black text-slate-600">Select Criteria to Load Entry Grid</h3></div>
        : filtered.length === 0 ? <div className="h-[300px] flex flex-col items-center justify-center opacity-40"><Users size={60} className="mb-4 text-slate-400" /><h3 className="text-xl font-black text-slate-600">No Students in this Section</h3></div>
        : <div className="divide-y divide-slate-100">
            <div className="px-6 py-4 bg-[#0F172A] text-gray-900 flex items-center justify-between"><div><h2 className="text-lg font-black uppercase">{cls} - {sec}</h2><p className="text-xs text-slate-300 font-medium">Entering marks for: <span className="font-bold text-[#3ac47d] uppercase">{sub}</span></p></div></div>
            <div className="px-6 py-3 grid grid-cols-12 gap-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200"><div className="col-span-1">Roll No</div><div className="col-span-4">Student Name</div><div className="col-span-2 text-center">Total Marks</div><div className="col-span-2 text-center">Obtained</div><div className="col-span-3 text-right">Result & Action</div></div>
            {filtered.sort((a, b) => (a.rollNumber || 0) - (b.rollNumber || 0)).map(s => {
              const oStr = getVal(s.id, "obtained"), tStr = getVal(s.id, "total");
              const pct = tStr && oStr ? ((Number(oStr) / Number(tStr)) * 100).toFixed(1) : "0.0";
              const g = grade(Number(oStr), Number(tStr));
              const saved = marks.some(m => m.studentId === s.id && norm(m.term) === norm(term) && norm(m.subject) === norm(sub));
              return (
                <div key={s.id} className={`px-6 py-3 grid grid-cols-12 gap-4 items-center transition-colors group ${saved ? 'bg-blue-50/30' : 'bg-white hover:bg-slate-50'}`}>
                  <div className="col-span-1 font-black text-slate-400 text-lg">{s.rollNumber || "-"}</div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border overflow-hidden shrink-0">{s.photoBase64 ? <img src={s.photoBase64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><Users size={14}/></div>}</div>
                    <div><p className="font-bold text-slate-800 text-sm flex items-center gap-2">{s.fullName || s.name}{saved && <span className="bg-blue-100 text-blue-600 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider">Saved</span>}</p><p className="text-[10px] text-slate-400 uppercase">{s.fatherName}</p></div>
                  </div>
                  <div className="col-span-2 flex justify-center"><input type="number" value={tStr} onChange={e => onChange(s.id, "total", e.target.value)} className="w-16 bg-slate-100 text-center rounded-lg py-2 text-sm font-bold border border-transparent focus:border-blue-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /></div>
                  <div className="col-span-2 flex justify-center"><input type="number" placeholder="0" value={oStr} onChange={e => onChange(s.id, "obtained", e.target.value)} className="w-20 bg-white text-center rounded-lg py-2 text-sm font-black border-2 border-slate-200 focus:border-[#3ac47d] focus:bg-[#f0fdf4] outline-none shadow-inner transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" /></div>
                  <div className="col-span-3 flex justify-end items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">{pct}%</span>
                    <span className={`w-8 text-center py-1 rounded-md text-xs font-black ${g === "U" ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{g}</span>
                    <RequirePermission permissions={[PERMISSIONS.exams.manage]}><button onClick={() => doSave(s)} disabled={savingRow === s.id || saveMut.isPending} className="bg-slate-200 hover:bg-[#3ac47d] hover:text-gray-900 text-slate-600 p-2 rounded-lg transition-colors" title="Save">{savingRow === s.id ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}</button></RequirePermission>
                  </div>
                </div>
              );
            })}
          </div>}
      </div>
      {cls && sec && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8 animate-fade-in-up">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center"><div className="flex items-center gap-2"><Database className="text-blue-500" size={20}/><h2 className="font-black text-slate-800">Live Database Ledger</h2></div><p className="text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-lg shadow-sm">Showing all marks for <span className="text-blue-600 uppercase">{cls} - {sec} ({term})</span></p></div>
          <div className="p-6">
            {marks.length === 0 ? <p className="text-center text-slate-400 font-bold py-10">No marks have been saved for this class and term yet.</p>
            : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-widest"><th className="pb-3 font-bold">Student Name</th><th className="pb-3 font-bold">Subject</th><th className="pb-3 font-bold">Marks (Obt/Tot)</th><th className="pb-3 font-bold">%</th><th className="pb-3 font-bold">Grade</th><th className="pb-3 font-bold text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{marks.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors"><td className="py-3 font-bold text-slate-800">{m.studentName}</td><td className="py-3 font-bold text-[#3ac47d] uppercase">{m.subject}</td><td className="py-3 font-black text-slate-600">{m.marksObtained} / {m.totalMarks}</td><td className="py-3 font-bold text-slate-500">{m.percentage}%</td><td className="py-3 font-black">{m.grade}</td><td className="py-3 text-right"><RequirePermission permissions={[PERMISSIONS.exams.manage]}><button onClick={() => { if (confirm("Are you sure?")) delMut.mutate(m.id); }} disabled={delMut.isPending} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-md transition-colors disabled:opacity-50">{delMut.isPending ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}</button></RequirePermission></td></tr>
            ))}</tbody></table></div>}
          </div>
        </div>
      )}
    </div>
  );
}
