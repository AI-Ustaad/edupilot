"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Clipboard, Check } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
      })
      .catch(console.error);
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
    const text = formatForCopy(examData);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatForCopy = (data: any) => {
    let text = "MCQs:\n";
    data.mcqs.forEach((mcq: any, i: number) => {
      text += `${i + 1}. ${mcq.question}\n`;
      mcq.options.forEach((opt: string) => text += `   ${opt}\n`);
      text += `   Correct: ${mcq.correct}\n\n`;
    });
    text += "Short Answers:\n";
    data.shortAnswers.forEach((sa: any, i: number) => {
      text += `${i + 1}. ${sa.question}\n   Answer: ${sa.modelAnswer}\n\n`;
    });
    text += "Long Answer:\n";
    text += `${data.longAnswer.question}\nAnswer: ${data.longAnswer.modelAnswer}`;
    return text;
  };

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <Sparkles className="text-blue-600" size={28} /> AI Exam Question Generator
      </h1>

      {/* Input Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Class</label>
          <select value={className} onChange={e => setClassName(e.target.value)} className={inputClass}>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-bold text-gray-700 mb-1 block">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className={inputClass}>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
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
        <button onClick={generateExam} disabled={loading} className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {loading ? "Generating..." : "Generate Exam Questions"}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>}

      {/* Result */}
      {examData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Generated Questions</h2>
            <button onClick={copyToClipboard} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition">
              {copied ? <Check size={16} className="text-green-600" /> : <Clipboard size={16} />}
              {copied ? "Copied!" : "Copy All"}
            </button>
          </div>

          {/* MCQs */}
          <div>
            <h3 className="text-lg font-bold text-blue-600 mb-3">MCQs</h3>
            {examData.mcqs.map((mcq: any, i: number) => (
              <div key={i} className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{i + 1}. {mcq.question}</p>
                <ul className="ml-5 mt-1 space-y-1 text-gray-700">
                  {mcq.options.map((opt: string, j: number) => (
                    <li key={j}>{opt}</li>
                  ))}
                </ul>
                <p className="text-sm text-green-600 font-bold mt-1">Correct: {mcq.correct}</p>
              </div>
            ))}
          </div>

          {/* Short Answers */}
          <div>
            <h3 className="text-lg font-bold text-purple-600 mb-3">Short Answer Questions</h3>
            {examData.shortAnswers.map((sa: any, i: number) => (
              <div key={i} className="mb-4 p-3 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{i + 1}. {sa.question}</p>
                <p className="text-gray-600 mt-1"><span className="font-bold">Model Answer:</span> {sa.modelAnswer}</p>
              </div>
            ))}
          </div>

          {/* Long Answer */}
          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-3">Long Answer Question</h3>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-900">{examData.longAnswer.question}</p>
              <p className="text-gray-600 mt-1"><span className="font-bold">Model Answer:</span> {examData.longAnswer.modelAnswer}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
