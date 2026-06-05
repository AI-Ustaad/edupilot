"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { Loader2, Plus, Eye } from "lucide-react";
import Link from "next/link";

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
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], correct: "" },
  ]);

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

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: "" }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !classGrade || !section || questions.some(q => !q.question || !q.correct)) return;
    setSaving(true);
    try {
      await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, classGrade, section, questions }),
      });
      setTitle("");
      setClassGrade("");
      setSection("");
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
      <h1 className="text-2xl font-black text-gray-900">Quizzes</h1>

      {/* Create Quiz Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Create New Quiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={classGrade} onChange={e => setClassGrade(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={section} onChange={e => setSection(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Section</option>
            {sections.filter((s: any) => s.classGrade === classGrade).map((s: any, idx: number) => (
              <option key={idx} value={s.sectionName}>{s.sectionName}</option>
            ))}
          </select>
        </div>

        {questions.map((q, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Question {idx + 1}</h3>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(idx)} className="text-red-500 text-sm hover:underline">Remove</button>
              )}
            </div>
            <input placeholder="Enter question" value={q.question} onChange={e => updateQuestion(idx, "question", e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl p-2 text-gray-900" />
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oIdx) => (
                <input key={oIdx} placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} value={opt}
                  onChange={e => {
                    const newOpts = [...q.options];
                    newOpts[oIdx] = e.target.value;
                    updateQuestion(idx, "options", newOpts);
                  }}
                  className="bg-white border border-gray-300 rounded-xl p-2 text-gray-900" />
              ))}
            </div>
            <input placeholder="Correct option (e.g., A)" value={q.correct} onChange={e => updateQuestion(idx, "correct", e.target.value.toUpperCase())}
              className="w-20 bg-white border border-gray-300 rounded-xl p-2 text-gray-900" maxLength={1} />
          </div>
        ))}

        <div className="flex gap-3">
          <button onClick={addQuestion} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
            <Plus size={18} /> Add Question
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition">
            {saving ? <Loader2 className="animate-spin" size={18} /> : "Create Quiz"}
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Class</th>
              <th className="p-4 text-left">Questions</th>
              <th className="p-4 text-right">Results</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">No quizzes created.</td></tr>
            ) : (
              quizzes.map((q: any) => (
                <tr key={q.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{q.title}</td>
                  <td className="p-4 text-gray-600">{q.classGrade} {q.section}</td>
                  <td className="p-4 text-gray-600">{q.questions?.length || 0}</td>
                  <td className="p-4 text-right">
                    <Link href={`/teacher/quizzes/results?quizId=${q.id}`}
                      className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 text-sm font-bold">
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
  );
}
