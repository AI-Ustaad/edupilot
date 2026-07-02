"use client";
import { useEffect, useState } from "react";
import { Loader2, Send, Calendar } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function TeacherHomeworkPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [assignments, setAssignments] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    // Live Classes Fetch
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => setClasses(data.data || []))
      .catch(console.error);

    // Subjects Fetch
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSubjects(data.subjects || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch("/api/homework")
      .then(res => res.json())
      .then(data => {
        if (data.success) setAssignments(data.data);
        else setAssignments(data);
      })
      .finally(() => setListLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classGrade || !section || !subject) {
      alert("Please fill all required fields (title, class, section, subject)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          classGrade,
          section,
          subject,
          dueDate: dueDate || undefined,
        }),
      });
      if (res.ok) {
        setMessage("Homework posted successfully!");
        setTitle("");
        setDescription("");
        setDueDate("");
        const updated = await fetch("/api/homework").then(r => r.json());
        setAssignments(updated.success ? updated.data : updated);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to post");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Extract Live Sections based on selected Class
  const selectedClassSections = classes.find((c: any) => c.classGrade === classGrade)?.sections || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Homework / Notice Management</h1>

      {message && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-4 font-bold">{message}</div>}

      <RequirePermission permissions={[PERMISSIONS.homework.create]}>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title (e.g., Math Homework)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Subject (e.g., Mathematics)"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              list="subject-list"
              required
            />
            <datalist id="subject-list">
              {subjects.map(s => <option key={s} value={s} />)}
            </datalist>

            <select
              value={classGrade}
              onChange={e => { setClassGrade(e.target.value); setSection(""); }}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
            </select>

            <select
              value={section}
              onChange={e => setSection(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              required
              disabled={!classGrade}
            >
              <option value="">Select Section</option>
              {selectedClassSections.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="flex items-center gap-2 border border-gray-200 bg-gray-50 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-500">
              <Calendar size={18} className="text-gray-400" />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-transparent text-gray-900 outline-none w-full"
                placeholder="Due Date (optional)"
              />
            </div>
          </div>

          <textarea
            placeholder="Description or instructions..."
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {loading ? "Posting..." : "Post Homework"}
          </button>
        </form>
      </RequirePermission>

      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4 border-b pb-2">Recently Posted</h2>
        {listLoading ? (
          <div className="text-center py-8"><Loader2 className="animate-spin mx-auto text-blue-600" size={32} /></div>
        ) : assignments.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500 font-medium">No homework posted yet.</div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a: any) => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{a.title}</h3>
                  {a.dueDate && (
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100 flex items-center gap-1">
                      <Calendar size={12}/> Due: {a.dueDate}
                    </span>
                  )}
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
