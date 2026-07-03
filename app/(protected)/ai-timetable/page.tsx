"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Download } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useGenerateTimetable } from "@/hooks/useAI";

export default function AITimetablePage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [periods, setPeriods] = useState(8);
  const [teachers, setTeachers] = useState("");
  const [timetable, setTimetable] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  // 1. Fetch Live Classes & Subjects
  const { data: classesData = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjectsList = settings?.subjects || [];

  // 2. AI Mutation Hook
  const generateMutation = useGenerateTimetable();

  const generateTimetable = () => {
    if (classes.length === 0 || subjects.length === 0 || !teachers.trim()) {
      setError("Please select at least one class, subject, and enter teachers.");
      return;
    }
    setError("");
    setTimetable(null);

    const teacherList = teachers.split(",").map((t) => t.trim());
    generateMutation.mutate(
      { classes, days, periods, subjects, teachers: teacherList },
      {
        onSuccess: (data) => setTimetable(data),
        onError: () => setError("Failed to generate timetable. Please try again."),
      }
    );
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
      <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 border-b pb-4">
        <Sparkles className="text-blue-600" /> AI Timetable Generator
      </h1>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
        <div>
          <label className="text-sm font-bold text-slate-700">Select Classes</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {classesData.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setClasses((prev) => prev.includes(c.classGrade) ? prev.filter((x) => x !== c.classGrade) : [...prev, c.classGrade])}
                className={`px-3 py-1.5 rounded-full text-sm font-bold border transition ${
                  classes.includes(c.classGrade) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {c.classGrade}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Select Subjects</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {subjectsList.map((s: string) => (
              <button
                key={s}
                onClick={() => setSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
                className={`px-3 py-1.5 rounded-full text-sm font-bold border transition ${
                  subjects.includes(s) ? "bg-green-600 text-white border-green-600" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
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
            className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700">Periods per Day</label>
          <input
            type="number"
            value={periods}
            onChange={(e) => setPeriods(Number(e.target.value))}
            min={1} max={12}
            className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 font-bold">{error}</div>}

      <RequirePermission permissions={["timetable.create" as any]}>
        <button onClick={generateTimetable} disabled={generateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 w-full sm:w-auto">
          {generateMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          {generateMutation.isPending ? "Generating..." : "Generate Timetable"}
        </button>
      </RequirePermission>

      {timetable && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-slate-800">Generated Timetable</h2>
            <button onClick={downloadCSV} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-gray-100 transition">
              <Download size={16} /> Download CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold">Day</th>
                  <th className="p-4 font-bold">Period</th>
                  <th className="p-4 font-bold">Subject</th>
                  <th className="p-4 font-bold">Class</th>
                  <th className="p-4 font-bold">Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timetable.map((entry: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{entry.day}</td>
                    <td className="p-4 font-medium text-gray-700">{entry.period}</td>
                    <td className="p-4 font-bold text-blue-600">{entry.subject}</td>
                    <td className="p-4 text-gray-700">{entry.class}</td>
                    <td className="p-4 text-gray-700">{entry.teacher}</td>
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
