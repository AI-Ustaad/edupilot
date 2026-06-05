export const dynamic = 'force-dynamic';
"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface ClassItem {
  name: string;
  sections: string[];
}

export default function SettingsPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // فارم اسٹیٹ
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        setClasses(json.data?.classes || json.classes || []);
        setSubjects(json.data?.subjects || json.subjects || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const addClass = () => {
    if (!newClass.trim()) return;
    setClasses((prev) => [...prev, { name: newClass.trim(), sections: [] }]);
    setNewClass("");
  };

  const addSection = () => {
    if (!selectedClass || !newSection.trim()) return;
    setClasses((prev) =>
      prev.map((c) =>
        c.name === selectedClass
          ? { ...c, sections: [...c.sections, newSection.trim()] }
          : c
      )
    );
    setNewSection("");
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    setSubjects((prev) => [...prev, newSubject.trim()]);
    setNewSubject("");
  };

  const publishChanges = async () => {
    // یہاں API کال کر کے سیٹنگز محفوظ کریں
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classes, subjects }),
    });
    alert("Settings published successfully!");
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">
        System Configuration
      </h1>

      {/* ماسٹر کلاسز */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">Master Classes</h2>
        <div className="flex gap-2 mb-4">
          <input
            placeholder="New class name"
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 flex-1"
          />
          <button
            onClick={addClass}
            className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>
        <ul className="space-y-2">
          {classes.map((c) => (
            <li key={c.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
              <span className="font-medium">{c.name}</span>
              <span className="text-sm text-gray-500">
                {c.sections.length} sections
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* سیکشنز */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">Sections</h2>
        <div className="flex gap-2 mb-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
          <input
            placeholder="New section name"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 flex-1"
          />
          <button
            onClick={addSection}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            Add Section
          </button>
        </div>
      </div>

      {/* مضامین */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">Subjects</h2>
        <div className="flex gap-2 mb-4">
          <input
            placeholder="New subject"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2 flex-1"
          />
          <button
            onClick={addSubject}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold"
          >
            Add Subject
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* پبلش بٹن – اب واضح نظر آئے گا */}
      <div className="text-right">
        <button
          onClick={publishChanges}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
        >
          Publish Change
        </button>
      </div>
    </div>
  );
}
