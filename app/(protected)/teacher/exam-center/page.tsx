"use client";
export const dynamic = 'force-dynamic';
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ExamCenterPage() {
  const [subject, setSubject] = useState("");
  const [mcqCount, setMcqCount] = useState(0);
  const [mcqMarks, setMcqMarks] = useState(0);
  const [shortCount, setShortCount] = useState(0);
  const [shortMarks, setShortMarks] = useState(0);
  const [longCount, setLongCount] = useState(0);
  const [longMarks, setLongMarks] = useState(0);
  const [saving, setSaving] = useState(false);

  const totalMarks = mcqCount * mcqMarks + shortCount * shortMarks + longCount * longMarks;

  const handleGenerate = async () => {
    setSaving(true);
    // Here you would call an API to save the paper structure
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert(`Paper created! Total marks: ${totalMarks}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Exam Center</h1>
      <div className="bg-white border rounded-2xl p-6 space-y-4">
        <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="border rounded-xl p-2 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">MCQs Count</label>
            <input type="number" value={mcqCount} onChange={e => setMcqCount(+e.target.value)} className="border rounded-xl p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Marks per MCQ</label>
            <input type="number" value={mcqMarks} onChange={e => setMcqMarks(+e.target.value)} className="border rounded-xl p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Short Questions Count</label>
            <input type="number" value={shortCount} onChange={e => setShortCount(+e.target.value)} className="border rounded-xl p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Marks per Short</label>
            <input type="number" value={shortMarks} onChange={e => setShortMarks(+e.target.value)} className="border rounded-xl p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Long Questions Count</label>
            <input type="number" value={longCount} onChange={e => setLongCount(+e.target.value)} className="border rounded-xl p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium">Marks per Long</label>
            <input type="number" value={longMarks} onChange={e => setLongMarks(+e.target.value)} className="border rounded-xl p-2 w-full" />
          </div>
        </div>
        <div className="text-lg font-bold">Total Marks: {totalMarks}</div>
        <button onClick={handleGenerate} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
          {saving ? <Loader2 className="animate-spin" size={18} /> : "Generate Paper"}
        </button>
        <p className="text-sm text-gray-500">
          Or use the <a href="/ai-exam-questions" className="text-blue-600 underline">AI Exam Generator</a> for automatic question generation.
        </p>
      </div>
    </div>
  );
}
