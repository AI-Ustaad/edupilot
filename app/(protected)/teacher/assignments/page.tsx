"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus, Eye } from "lucide-react";
import Link from "next/link";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    classGrade: "",
    section: "",
    dueDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchAssignments();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setClasses(data.classes || []);
    setSections(data.sections || []);
  };

  const fetchAssignments = async () => {
    const res = await fetch("/api/assignments");
    const data = await res.json();
    setAssignments(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.classGrade || !form.section || !form.dueDate) return;
    setSaving(true);
    try {
      await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ title: "", description: "", classGrade: "", section: "", dueDate: "" });
      fetchAssignments();
    } catch (err) {
      alert("Failed to create assignment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Assignments</h1>

      {/* Create Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Assignment</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="col-span-2 bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
          <select value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value })}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Select Section</option>
            {sections.filter((s: any) => s.classGrade === form.classGrade).map((s: any, idx: number) => (
              <option key={idx} value={s.sectionName}>{s.sectionName}</option>
            ))}
          </select>
          <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <button type="submit" disabled={saving}
            className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Create Assignment
          </button>
        </form>
      </div>

      {/* Assignment List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Class</th>
              <th className="p-4 text-left">Due</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">No assignments created.</td></tr>
            ) : (
              assignments.map((a: any) => (
                <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{a.title}</td>
                  <td className="p-4 text-gray-600">{a.classGrade} {a.section}</td>
                  <td className="p-4 text-gray-600">{new Date(a.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Link href={`/teacher/assignments/submissions?assignmentId=${a.id}`}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-bold">
                      <Eye size={16} /> Submissions
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
