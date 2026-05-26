"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Download, Trash2 } from "lucide-react";

export default function AITimetablePage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [periods, setPeriods] = useState(8);
  const [teachers, setTeachers] = useState("");
  const [timetable, setTimetable] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
      })
      .catch(console.error);
  }, []);

  const generateTimetable = async () => {
    if (selectedClasses.length === 0 || selectedSubjects.length === 0 || !teachers.trim()) {
      setError("Please select at least one class, subject, and enter teachers.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const teacherList = teachers.split(",").map((t) => t.trim());
      const res = await fetch("/api/ai/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classes: selectedClasses,
          days,
          periods,
          subjects: selectedSubjects,
          teachers: teacherList,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTimetable(data);
      } else {
        setError(data.message || "Failed to generate timetable");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!timetable) return;
    const header = "Day,Period,Subject,Class,Teacher";
    const rows = timetable.map((e: any) => `${e.day},${e.period},${e.subject},${e.class},${e.teacher}`).join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai_timetable.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
        <Sparkles className="text-primary" /> AI Timetable Generator
      </h1>

      {/* Settings Panel */}
      <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-bold text-slate-700">Select Classes</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() =>
                  setSelectedClasses((prev) =>
                    prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
                  )
                }
                className={`px-3 py-1 rounded-full text-sm font-bold border transition ${
                  selectedClasses.includes(c)
                    ? "bg-primary text-white border-primary"
                    : "glass-btn"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Select Subjects</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() =>
                  setSelectedSubjects((prev) =>
                    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
                  )
                }
                className={`px-3 py-1 rounded-full text-sm font-bold border transition ${
                  selectedSubjects.includes(s)
                    ? "bg-accent text-white border-accent"
                    : "glass-btn"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Teachers (comma separated)</label>
          <input
            type="text"
            value={teachers}
            onChange={(e) => setTeachers(e.target.value)}
            placeholder="e.g. Sir Ahmed, Ms. Fatima"
            className="w-full mt-2 bg-white/60 backdrop-blur-sm border border-white/25 rounded-xl p-2"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Periods per Day</label>
          <input
            type="number"
            value={periods}
            onChange={(e) => setPeriods(Number(e.target.value))}
            min={1}
            max={12}
            className="w-full mt-2 bg-white/60 backdrop-blur-sm border border-white/25 rounded-xl p-2"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>}

      <button onClick={generateTimetable} disabled={loading} className="btn-primary flex items-center gap-2">
        {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
        {loading ? "Generating..." : "Generate Timetable"}
      </button>

      {/* Result Table */}
      {timetable && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-white/20">
            <h2 className="text-lg font-bold text-slate-800">Generated Timetable</h2>
            <button onClick={downloadCSV} className="glass-btn flex items-center gap-2 text-sm">
              <Download size={16} /> Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/20 text-slate-700">
                <tr>
                  <th className="p-3 text-left">Day</th>
                  <th className="p-3 text-left">Period</th>
                  <th className="p-3 text-left">Subject</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-left">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((entry: any, idx: number) => (
                  <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-3">{entry.day}</td>
                    <td className="p-3">{entry.period}</td>
                    <td className="p-3">{entry.subject}</td>
                    <td className="p-3">{entry.class}</td>
                    <td className="p-3">{entry.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
