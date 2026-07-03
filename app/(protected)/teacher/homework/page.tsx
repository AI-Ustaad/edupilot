"use client";
import { useState } from "react";
import { Loader2, Send, Calendar, CheckCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useHomework, useCreateHomework } from "@/hooks/useHomework";

export default function TeacherHomeworkPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [success, setSuccess] = useState("");

  const { data: classes = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];
  
  const { data: assignments = [], isLoading: listLoading } = useHomework();
  const createMutation = useCreateHomework();

  const availableSections = classes.filter((c: any) => c.classGrade === classGrade).map((c: any) => c.sectionName || c.section);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { title, description, classGrade, section, subject, dueDate },
      {
        onSuccess: () => {
          setSuccess("Homework posted successfully!");
          setTitle(""); setDescription(""); setDueDate("");
          setTimeout(() => setSuccess(""), 3000);
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Homework Management</h1>
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-4 font-bold flex items-center gap-2"><CheckCircle size={20} /> {success}</div>}

      <RequirePermission permissions={[PERMISSIONS.homework.create]}>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-gray-50 border rounded-xl p-3" required />
            <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} list="subject-list" className="bg-gray-50 border rounded-xl p-3" required />
            <datalist id="subject-list">{subjects.map(s => <option key={s} value={s} />)}</datalist>
            <select value={classGrade} onChange={e => { setClassGrade(e.target.value); setSection(""); }} className="bg-gray-50 border rounded-xl p-3" required>
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
            </select>
            <select value={section} onChange={e => setSection(e.target.value)} className="bg-gray-50 border rounded-xl p-3 disabled:opacity-50" required disabled={!classGrade}>
              <option value="">Select Section</option>
              {availableSections.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-2 border bg-gray-50 rounded-xl p-3">
              <Calendar size={18} className="text-gray-400" />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-transparent outline-none w-full" />
            </div>
          </div>
          <textarea placeholder="Description" rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3" required />
          <button type="submit" disabled={createMutation.isPending} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
            {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Post Homework
          </button>
        </form>
      </RequirePermission>

      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4 border-b pb-2">Recently Posted</h2>
        {listLoading ? <Loader2 className="animate-spin mx-auto text-blue-600" size={32} /> : assignments.length === 0 ? (
          <div className="bg-gray-50 border rounded-xl p-8 text-center text-gray-500">No homework posted yet.</div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a: any) => (
              <div key={a.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{a.title}</h3>
                  {a.dueDate && <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full border border-red-100 flex items-center gap-1"><Calendar size={12}/> Due: {a.dueDate}</span>}
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md border border-blue-100">{a.classGrade} - {a.section}</span>
                  <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-md border border-purple-100">{a.subject}</span>
                </div>
                <p className="text-sm text-gray-600">{a.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
