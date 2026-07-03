"use client";
import { useState } from "react";
import { Loader2, Plus, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/components/ToastProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { safeArray } from "@/lib/api/safeResponse";
import { useAuth } from "@/context/AuthContext";
import { TableSkeleton } from "@/components/Skeletons";

interface Question { question: string; options: string[]; correct: string; }

export default function TeacherQuizzesPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["quizzes", tenantId],
    queryFn: async () => safeArray(await apiClient.get("/quizzes")),
  });

  const { data: classesData = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];

  const [title, setTitle] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [section, setSection] = useState("");
  const [subject, setSubject] = useState("");
  const [questions, setQuestions] = useState<Question[]>([{ question: "", options: ["", "", "", ""], correct: "" }]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiClient.post("/quizzes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes", tenantId] });
      showToast("Quiz published successfully!", "success");
      setTitle(""); setClassGrade(""); setSection(""); setSubject("");
      setQuestions([{ question: "", options: ["", "", "", ""], correct: "" }]);
    },
    onError: () => showToast("Failed to create quiz.", "error"),
  });

  const availableSections = classesData.filter((c: any) => c.classGrade === classGrade).map((c: any) => c.sectionName || c.section);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !classGrade || !section || questions.length === 0) return;
    createMutation.mutate({ title, classGrade, section, subject, questions });
  };

  if (isLoading) return <div className="p-8"><TableSkeleton rows={5} cols={4} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Manage Quizzes</h1>

      <RequirePermission permissions={[PERMISSIONS.quizzes.create]}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Quiz</h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Quiz Title" value={title} onChange={e => setTitle(e.target.value)} className="border bg-gray-50 rounded-xl p-3" required />
              <select value={classGrade} onChange={e => { setClassGrade(e.target.value); setSection(""); }} className="border bg-gray-50 rounded-xl p-3" required>
                <option value="">Select Class</option>
                {classesData.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
              </select>
              <select value={section} onChange={e => setSection(e.target.value)} className="border bg-gray-50 rounded-xl p-3 disabled:opacity-50" required disabled={!classGrade}>
                <option value="">Select Section</option>
                {availableSections.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} list="subject-list" className="border bg-gray-50 rounded-xl p-3" required />
              <datalist id="subject-list">{subjects.map(s => <option key={s} value={s} />)}</datalist>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Questions</h3>
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50 border p-5 rounded-xl space-y-3 relative shadow-sm">
                  <span className="absolute -top-3 -left-3 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm">{qIndex + 1}</span>
                  <input placeholder={`Question ${qIndex + 1}`} value={q.question} onChange={e => { const arr = [...questions]; arr[qIndex].question = e.target.value; setQuestions(arr); }} className="w-full border rounded-lg p-3" required />
                  <div className="grid grid-cols-2 gap-3">
                    {q.options.map((opt, optIndex) => (
                      <input key={optIndex} placeholder={`Option ${optIndex + 1}`} value={opt} onChange={e => { const arr = [...questions]; arr[qIndex].options[optIndex] = e.target.value; setQuestions(arr); }} className="border rounded-lg p-3" required />
                    ))}
                  </div>
                  <input placeholder="Correct Answer (Must match exactly)" value={q.correct} onChange={e => { const arr = [...questions]; arr[qIndex].correct = e.target.value; setQuestions(arr); }} className="w-full border-2 border-green-400 bg-green-50 rounded-lg p-3" required />
                </div>
              ))}
              <button type="button" onClick={() => setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: "" }])} className="text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-4 py-2 rounded-lg">
                <Plus size={16} /> Add Question
              </button>
            </div>

            <button type="submit" disabled={createMutation.isPending} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />} Publish Quiz
            </button>
          </form>
        </div>
      </RequirePermission>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold">Title</th>
              <th className="p-4 font-bold">Class</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {quizzes.length === 0 ? (
              <tr><td colSpan={3} className="p-8 text-center text-gray-400">No quizzes created yet.</td></tr>
            ) : (
              quizzes.map((q: any) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{q.title}</td>
                  <td className="p-4 text-gray-700 font-medium">{q.classGrade} {q.section}</td>
                  <td className="p-4 text-right">
                    <Link href={`/teacher/quizzes/results?quizId=${q.id}`} className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg inline-flex items-center gap-1 text-sm font-bold border border-blue-100">
                      <Eye size={16} /> Results
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
