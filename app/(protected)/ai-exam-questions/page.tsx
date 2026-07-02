"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Clipboard, Check } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🛡️ Safe Array Helper
const safeArray = (data: any) => Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

export default function AIExamQuestionsPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const classesRes = await fetch("/api/classes");
        const classesJson = await classesRes.json();
        const classesData = safeArray(classesJson);
        setClasses(Array.from(new Set(classesData.map((c: any) => c.classGrade as string))));

        const settingsRes = await fetch("/api/settings");
        const settingsJson = await settingsRes.json();
        setSubjects(safeArray(settingsJson.subjects || settingsJson.data?.subjects));
      } catch (err) {
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const generateExam = async () => {
    if (!className || !subject || !topic.trim()) {
      setError("Please fill all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/exam-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, subject, topic, difficulty }),
      });
      const data = await res.json();
      if (res.ok) {
        setExamData(data);
      } else {
        setError(data.message || "Failed to generate questions");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!examData) return;
    let text = "MCQs:\n";
    examData.mcqs.forEach((mcq: any, i: number) => {
      text += `${i + 1}. ${mcq.question}\n`;
      mcq.options.forEach((opt: string) => text += `   ${opt}\n`);
      text += `   Correct: ${mcq.correct}\n\n`;
    });
    text += "Short Answers:\n";
    examData.shortAnswers.forEach((sa: any, i: number) => {
      text += `${i + 1}. ${sa.question}\n   Answer: ${sa.modelAnswer}\n\n`;
    });
    text += "Long Answer:\n";
    text += `${examData.longAnswer.question}\nAnswer: ${examData.longAnswer.modelAnswer}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = "w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <Sparkles className="text-blue-600" size={32} />
        <div>
          <h1 className="text-2xl font-black text-gray-900">AI Exam Question Generator</h1>
          <p className="text-gray-500 text-sm">Instantly create MCQs, short, and long questions.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm">
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Class</label>
          <select value={className} onChange={e => setClassName(e.target.value)} className={inputClass} disabled={dataLoading}>
            <option value="">{dataLoading ? "Loading..." : "Select Class"}</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className={inputClass} disabled={dataLoading}>
            <option value="">{dataLoading ? "Loading..." : "Select Subject"}</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Topic</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Quadratic Equations" className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
            <option>Easy</option><option>Medium</option><option>Hard</option>
          </select>
        </div>

        <RequirePermission permissions={[PERMISSIONS.exams.manage]}>
          <button onClick={generateExam} disabled={loading} className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition mt-2 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {loading ? "Generating..." : "Generate Exam Questions"}
          </button>
        </RequirePermission>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-bold">{error}</div>}

      {examData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Generated Questions</h2>
            <button onClick={copyToClipboard} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition">
              {copied ? <Check size={16} className="text-green-600" /> : <Clipboard size={16} />}
              {copied ? "Copied!" : "Copy All"}
            </button>
          </div>

          <div>
            <h3 className="text-lg font-bold text-blue-600 mb-3">MCQs</h3>
            {examData.mcqs.map((mcq: any, i: number) => (
              <div key={i} className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="font-semibold text-gray-900">{i + 1}. {mcq.question}</p>
                <ul className="ml-5 mt-2 space-y-1 text-gray-700">
                  {mcq.options.map((opt: string, j: number) => <li key={j}>{opt}</li>)}
                </ul>
                <p className="text-sm text-green-600 font-bold mt-2">Correct: {mcq.correct}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-3">Short Answer Questions</h3>
            {examData.shortAnswers.map((sa: any, i: number) => (
              <div key={i} className="mb-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="font-semibold text-gray-900">{i + 1}. {sa.question}</p>
                <p className="text-gray-600 mt-2"><span className="font-bold">Model Answer:</span> {sa.modelAnswer}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-3">Long Answer Question</h3>
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <p className="font-semibold text-gray-900">{examData.longAnswer.question}</p>
              <p className="text-gray-600 mt-2"><span className="font-bold">Model Answer:</span> {examData.longAnswer.modelAnswer}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
