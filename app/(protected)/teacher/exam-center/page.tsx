"use client";
import { useEffect, useState } from "react";
import { Loader2, Download, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";

export default function ExamCenterPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [questionTypes, setQuestionTypes] = useState([
    { type: "mcq", count: 10, marksPerQuestion: 2 },
    { type: "short", count: 5, marksPerQuestion: 4 },
    { type: "long", count: 2, marksPerQuestion: 10 },
  ]);
  const [totalMarks, setTotalMarks] = useState(100);
  const [examPaper, setExamPaper] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setClasses(data.classes || []));
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetch(`/api/books?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}`)
        .then(res => res.json())
        .then(data => setBooks(Array.isArray(data) ? data : []));
    }
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (selectedBookId) {
      const book = books.find(b => b.id === selectedBookId);
      setChapters(book?.chapters || []);
      setSelectedChapters([]);
    }
  }, [selectedBookId, books]);

  const toggleChapter = (title: string) => {
    setSelectedChapters(prev =>
      prev.includes(title) ? prev.filter(c => c !== title) : [...prev, title]
    );
  };

  const handleGenerate = async () => {
    if (!selectedBookId || !selectedClass || !selectedSubject || selectedChapters.length === 0) {
      alert("Please select all fields");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/exam-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookTitle: books.find(b => b.id === selectedBookId)?.title || "",
          chapters: selectedChapters,
          classGrade: selectedClass,
          subject: selectedSubject,
          questionTypes,
          totalMarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setExamPaper(data);
      } else {
        alert("Error: " + (data.message || "Failed"));
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!examPaper) return;
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(16).setFont("helvetica", "bold");
    doc.text(examPaper.title || "Exam Paper", 105, y, { align: "center" });
    y += 10;
    if (examPaper.instructions) {
      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(examPaper.instructions, 14, y);
      y += 8;
    }
    y += 5;

    examPaper.questions?.forEach((q: any, idx: number) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11).setFont("helvetica", "bold");
      doc.text(`Q${idx + 1} (${q.type.toUpperCase()} - ${q.marks} marks): ${q.question}`, 14, y);
      y += 7;
      if (q.options) {
        doc.setFont("helvetica", "normal");
        q.options.forEach((opt: string) => {
          doc.text(`   ${opt}`, 18, y);
          y += 5;
        });
      }
      y += 3;
    });

    doc.save(`${examPaper.title || "Exam_Paper"}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Exam Center</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="text" placeholder="Subject" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900" />
        </div>
        <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900" disabled={!selectedSubject}>
          <option value="">Select Book</option>
          {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>

        {chapters.length > 0 && (
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 block">Select Chapters</label>
            <div className="flex flex-wrap gap-2">
              {chapters.map((ch: any) => (
                <button
                  key={ch.title}
                  onClick={() => toggleChapter(ch.title)}
                  className={`px-3 py-1 rounded-full text-sm font-bold border transition ${
                    selectedChapters.includes(ch.title)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleGenerate} disabled={generating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
          {generating ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          {generating ? "Generating..." : "Generate Exam Paper"}
        </button>

        {examPaper && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{examPaper.title}</h2>
              <button onClick={downloadPDF} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <Download size={16} /> Download PDF
              </button>
            </div>
            {examPaper.instructions && (
              <p className="text-sm text-gray-600 mb-4">{examPaper.instructions}</p>
            )}
            <div className="space-y-4">
              {examPaper.questions?.map((q: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4">
                  <p className="font-bold text-gray-900">
                    Q{idx + 1} ({q.type.toUpperCase()} - {q.marks} marks): {q.question}
                  </p>
                  {q.options && (
                    <ul className="mt-2 ml-4 space-y-1 text-gray-700">
                      {q.options.map((opt: string, i: number) => (
                        <li key={i}>{opt}</li>
                      ))}
                    </ul>
                  )}
                  {q.modelAnswer && (
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-bold">Model Answer:</span> {q.modelAnswer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
