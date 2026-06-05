"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { Loader2, Plus, Upload, X } from "lucide-react";

interface Chapter {
  title: string;
  contentText: string;
  file: File | null;
  fileUrl?: string;
}

export default function ManageBooksPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([{ title: "", contentText: "", file: null }]);
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchBooks();
  }, []);

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setClasses(data.classes || []);
    setSubjects(data.subjects || []);
  };

  const fetchBooks = async () => {
    const res = await fetch("/api/books");
    const data = await res.json();
    setBooks(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const addChapter = () => {
    setChapters([...chapters, { title: "", contentText: "", file: null }]);
  };

  const updateChapter = (index: number, field: keyof Chapter, value: any) => {
    const updated = [...chapters];
    (updated[index] as any)[field] = value;
    setChapters(updated);
  };

  const removeChapter = (index: number) => {
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !classGrade || !subject) return;
    setSaving(true);
    try {
      // فائلیں اپ لوڈ کریں (اگر کوئی ہوں) اور URLs حاصل کریں
      const processedChapters = await Promise.all(
        chapters.map(async (ch) => {
          let fileUrl = ch.fileUrl || "";
          if (ch.file) {
            const formData = new FormData();
            formData.append("file", ch.file);
            formData.append("folder", "book-content");
            const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
            const uploadData = await uploadRes.json();
            if (uploadRes.ok) fileUrl = uploadData.url;
          }
          return { title: ch.title, contentText: ch.contentText, fileUrl };
        })
      );

      await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, classGrade, subject, chapters: processedChapters }),
      });
      setTitle("");
      setClassGrade("");
      setSubject("");
      setChapters([{ title: "", contentText: "", file: null }]);
      fetchBooks();
    } catch (err) {
      alert("Failed to add book");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Manage Books</h1>

      {/* Add Book Form */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Add New Book</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Book Title" value={title} onChange={e => setTitle(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900" required />
          <select value={classGrade} onChange={e => setClassGrade(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900" required>
            <option value="">Select Class</option>
            {classes.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900" required>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Chapters */}
        <h3 className="font-semibold text-gray-700">Chapters</h3>
        {chapters.map((ch, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Chapter {idx + 1}</span>
              {chapters.length > 1 && (
                <button onClick={() => removeChapter(idx)} className="text-red-500 text-sm hover:underline">Remove</button>
              )}
            </div>
            <input placeholder="Chapter Title" value={ch.title} onChange={e => updateChapter(idx, "title", e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl p-2 text-gray-900" />
            <textarea placeholder="Paste or type chapter text (optional)" value={ch.contentText}
              onChange={e => updateChapter(idx, "contentText", e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl p-2 text-gray-900" rows={3} />
            <div>
              <label className="text-sm text-gray-500">Upload File (PDF/Word/Image)</label>
              <input type="file" accept=".pdf,.doc,.docx,image/*"
                onChange={e => updateChapter(idx, "file", e.target.files?.[0] || null)}
                className="text-sm" />
            </div>
          </div>
        ))}
        <button onClick={addChapter} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
          <Plus size={18} /> Add Chapter
        </button>

        <button onClick={handleSubmit} disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Save Book
        </button>
      </div>

      {/* Books List */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Class</th>
              <th className="p-4 text-left">Subject</th>
              <th className="p-4 text-left">Chapters</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">No books added yet.</td></tr>
            ) : (
              books.map(b => (
                <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{b.title}</td>
                  <td className="p-4 text-gray-600">{b.classGrade}</td>
                  <td className="p-4 text-gray-600">{b.subject}</td>
                  <td className="p-4 text-gray-600">{b.chapters?.length || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
