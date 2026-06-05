"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { Loader2, Send, Calendar } from "lucide-react";

interface ClassInfo {
  name: string;
  sections: string[];
}

export default function TeacherHomeworkPage() {
  // فارم فیلڈز
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // پچھلی اسائنمنٹس
  const [assignments, setAssignments] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);

  // کلاسز اور مضامین سیٹنگز سے لوڈ کریں (فرض کریں کہ /api/settings یہ ڈیٹا واپس کرتا ہے)
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
      })
      .catch(console.error);
  }, []);

  // پچھلی ہوم ورک لوڈ کریں
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
        // فہرست ریفریش کریں
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

  // کلاس تبدیل ہونے پر سیکشنز دکھائیں
  const selectedClassSections = classes.find(c => c.name === classGrade)?.sections || [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Homework / Notice Management</h1>

      {message && <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4">{message}</div>}

      {/* تخلیق کا فارم */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title (e.g., Math Homework)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
            required
          />
          <input
            type="text"
            placeholder="Subject (e.g., Mathematics)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
            list="subject-list"
            required
          />
          <datalist id="subject-list">
            {subjects.map(s => <option key={s} value={s} />)}
          </datalist>

          <select
            value={classGrade}
            onChange={e => { setClassGrade(e.target.value); setSection(""); }}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
            required
          >
            <option value="">Select Class</option>
            {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>

          <select
            value={section}
            onChange={e => setSection(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
            required
            disabled={!classGrade}
          >
            <option value="">Select Section</option>
            {selectedClassSections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="flex items-center gap-2 border border-gray-300 rounded-xl p-3">
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
          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {loading ? "Posting..." : "Post Homework"}
        </button>
      </form>

      {/* اسائنمنٹس کی فہرست */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recently Posted</h2>
        {listLoading ? (
          <div className="text-center py-8"><Loader2 className="animate-spin mx-auto" /></div>
        ) : assignments.length === 0 ? (
          <div className="text-gray-400 py-8 text-center">No homework posted yet.</div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a: any) => (
              <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-gray-900">{a.title}</p>
                  <p className="text-sm text-gray-500">{a.classGrade} - {a.section} | {a.subject}</p>
                  <p className="text-sm text-gray-600">{a.description}</p>
                  {a.dueDate && <p className="text-xs text-red-500 mt-1">Due: {a.dueDate}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
