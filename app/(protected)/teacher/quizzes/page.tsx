"use client";
import { useEffect, useState } from "react";
import { Loader2, Plus, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface Question {
  question: string;
  options: string[];
  correct: string;
}

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  
  const [title, setTitle] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subject, setSubject] = useState("");
  
  const [questions, setQuestions] = useState<Question[]>([{ question: "", options: ["", "", "", ""], correct: "" }]);

  useEffect(() => {
    fetchSettings();
    fetchQuizzes();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setClasses(data.classes || []);
    setSections(data.sections || []);
  };

  const fetchQuizzes = async () => {
    const res = await fetch("/api/quizzes");
    const data = await res.json();
    setQuizzes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const addQuestion = () => setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: "" }]);

  const updateQuestion = (index: number, field: string, value: string) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !classGrade || !section || questions.length === 0) return;
    setSaving(true);
    try {
      await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, classGrade, section, subject, dueDate, questions }),
      });
      setTitle(""); setClassGrade(""); setSection(""); setSubject(""); setDueDate("");
      setQuestions([{ question: "", options: ["", "", "", ""], correct: "" }]);
      fetchQuizzes();
    } catch (err) {
      alert("Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Manage Quizzes</h1>

      {/* 🛡️ Protected Create Form */}
      <RequirePermission permissions={[PERMISSIONS.quizzes.create]}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Quiz</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
              <select value={classGrade} onChange={e => setClassGrade(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={section} onChange={e => setSection(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required>
                <option value="">Select Section</option>
                {sections.filter((s: any) => s.classGrade === classGrade).map((s: any, idx) => (
                  <option key={idx} value={s.sectionName}>{s.sectionName}</option>
                ))}
              </select>
              <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Questions</h3>
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3 relative shadow-sm">
                  <span className="absolute -top-3 -left-3 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-md">{qIndex + 1}</span>
                  <input placeholder={`Question ${qIndex + 1}`} value={q.question} onChange={e => updateQuestion(qIndex, "question", e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, optIndex) => (
                      <input key={optIndex} placeholder={`Option ${optIndex + 1}`} value={opt} onChange={e => updateOption(qIndex, optIndex, e.target.value)} className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" required />
                    ))}
                  </div>
                  <input placeholder="Correct Answer (Must match one option exactly)" value={q.correct} onChange={e => updateQuestion(qIndex, "correct", e.target.value)} className="w-full border-2 border-green-400 bg-green-50 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none placeholder-green-700 font-medium" required />
                </div>
              ))}
              <button type="button" onClick={addQuestion} className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-800 transition bg-blue-50 px-4 py-2 rounded-lg">
                <Plus size={16} /> Add Another Question
              </button>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Publish Quiz
            </button>
          </form>
        </div>
      </RequirePermission>

      {/* Quizzes List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-bold">Title</th>
                <th className="p-4 font-bold">Class</th>
                <th className="p-4 font-bold">Questions</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quizzes.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">No quizzes created yet.</td></tr>
              ) : (
                quizzes.map((q: any) => (
                  <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{q.title}</td>
                    <td className="p-4 text-gray-700 font-medium">{q.classGrade} {q.section}</td>
                    <td className="p-4 text-gray-600 font-bold bg-gray-50 rounded-md w-max inline-block mt-3 ml-4 px-3 py-1">{q.questions?.length || 0}</td>
                    <td className="p-4 text-right">
                      <Link href={`/teacher/quizzes/results?quizId=${q.id}`} className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg inline-flex items-center gap-1 text-sm font-bold transition border border-blue-100">
                        <Eye size={16} /> View Results
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
