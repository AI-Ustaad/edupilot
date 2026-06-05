"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { Loader2, Save, Star } from "lucide-react";

const SKILL_CATEGORIES = [
  "Creative Thinking",
  "Discipline",
  "Teamwork",
  "Communication",
  "Problem Solving",
];

export default function TeacherSkillsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("1st Term");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // طلبہ اور مضامین لوڈ کریں
    fetch("/api/students")
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []));

    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setSubjects(data.subjects || []));
  }, []);

  const handleRating = (skill: string, value: number) => {
    setRatings(prev => ({ ...prev, [skill]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedStudentId || !selectedSubject || !selectedTerm) {
      alert("Please select student, term, and subject.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/marks/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          term: selectedTerm,
          subject: selectedSubject,
          skills: ratings,
        }),
      });
      if (res.ok) {
        setSuccess("Skills saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
        setRatings({});
      } else {
        const err = await res.json();
        alert("Error: " + (err.message || "Failed"));
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <Star className="text-blue-600" /> Add Skills Assessment
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} className={inputClass}>
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.fullName || s.name} ({s.classGrade})</option>
            ))}
          </select>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)} className={inputClass}>
            <option>1st Term</option>
            <option>2nd Term</option>
            <option>Final Exams</option>
          </select>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={inputClass}>
            <option value="">Select Subject</option>
            {subjects.map(sub => <option key={sub}>{sub}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Skill Ratings (1-5)</h2>
          {SKILL_CATEGORIES.map(skill => (
            <div key={skill} className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">{skill}</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleRating(skill, num)}
                    className={`w-10 h-10 rounded-full text-sm font-bold border transition ${
                      ratings[skill] === num
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl">{success}</div>}

        <button onClick={handleSubmit} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition">
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Skills"}
        </button>
      </div>
    </div>
  );
}
