"use client";
import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";

export default function BookCenterPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [subject, setSubject] = useState("");
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [type, setType] = useState("quiz");
  const [dueDate, setDueDate] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setClasses(data.classes || []);
        setSections(data.sections || []);
      });
  }, []);

  // جب کلاس یا مضمون بدلے تو کتابیں لوڈ کریں
  useEffect(() => {
    if (selectedClass && subject) {
      fetch(`/api/books?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(subject)}`)
        .then(res => res.json())
        .then(data => setBooks(Array.isArray(data) ? data : []));
    } else {
      setBooks([]);
    }
  }, [selectedClass, subject]);

  // جب کتاب منتخب ہو تو اس کے ابواب لوڈ کریں
  useEffect(() => {
    if (selectedBookId) {
      const book = books.find(b => b.id === selectedBookId);
      setChapters(book?.chapters || []);
    } else {
      setChapters([]);
    }
  }, [selectedBookId, books]);

  const handleGenerate = async () => {
    if (!selectedClass || !selectedSection || !subject || !selectedChapter || !type) {
      alert("Please fill all fields");
      return;
    }
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/smart-book-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classGrade: selectedClass,
          section: selectedSection,
          subject,
          chapter: selectedChapter,
          bookId: selectedBookId,
          type,
          dueDate: dueDate || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert("Error: " + (data.message || "Failed"));
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Smart Book Center</h1>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(""); }}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900">
            <option value="">Select Class</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900" disabled={!selectedClass}>
            <option value="">Select Section</option>
            {sections.filter((s: any) => s.classGrade === selectedClass).map((s: any, idx: number) => (
              <option key={idx} value={s.sectionName}>{s.sectionName}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Subject (e.g., Mathematics)" value={subject} onChange={e => setSubject(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900" />
          <select value={selectedBookId} onChange={e => setSelectedBookId(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900" disabled={!subject}>
            <option value="">Select Book</option>
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </div>
        <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900" disabled={!selectedBookId}>
          <option value="">Select Chapter</option>
          {chapters.map((ch: any, idx: number) => (
            <option key={idx} value={ch.title}>{ch.title}</option>
          ))}
        </select>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={type} onChange={e => setType(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900">
            <option value="quiz">Quiz (MCQs)</option>
            <option value="test">Test (MCQs + Short + Long)</option>
            <option value="lesson_plan">Lesson Plan</option>
            <option value="homework">Homework</option>
            <option value="assignment">Assignment</option>
          </select>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900" />
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
          {generating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {generating ? "Generating & Assigning..." : "Generate & Assign to Class"}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
            ✅ Success! {result.type} created and assigned to {result.studentsNotified} students. Parents have been notified.
          </div>
        )}
      </div>
    </div>
  );
}
