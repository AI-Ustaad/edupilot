"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Clock, Save, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const norm = (str?: string) => (str || "").trim().toLowerCase();

export default function TimetablePage() {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [savedTimetables, setSavedTimetables] = useState<any[]>([]);
  const [schoolPeriods, setSchoolPeriods] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [gridData, setGridData] = useState<Record<string, { subject: string; teacherId: string; teacherName: string }>>({});

  useEffect(() => {
    setIsMounted(true);
    const unsubSections = onSnapshot(query(collection(db, "sections")), (snap) =>
      setSections(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubStaff = onSnapshot(query(collection(db, "staff")), (snap) =>
      setStaff(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubTimetables = onSnapshot(query(collection(db, "timetables")), (snap) =>
      setSavedTimetables(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    const loadPeriods = async () => {
      try {
        const res = await fetch("/api/settings", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSchoolPeriods(data.periods || []);
        }
      } catch (err) {
        console.error("Failed to load periods", err);
      }
    };
    loadPeriods();

    return () => {
      unsubSections();
      unsubStaff();
      unsubTimetables();
    };
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      const docId = `${norm(selectedClass)}_${norm(selectedSection)}`;
      const existing = savedTimetables.find((t) => t.id === docId);
      setGridData(existing?.schedule || {});
    } else {
      setGridData({});
    }
  }, [selectedClass, selectedSection, savedTimetables]);

  const availableClasses = Array.from(new Set(sections.map((s) => s.classGrade)));
  const availableSections = sections.filter((s) => norm(s.classGrade) === norm(selectedClass));
  const displayStaff = staff.filter((s) => {
    const des = norm(s.professional?.designation);
    return des.includes("teacher") || des.includes("s.s.e") || des.includes("lecturer");
  });

  const handleCellChange = (day: string, period: string, field: "subject" | "teacherId", value: string) => {
    const key = `${day}-${period}`;
    setGridData((prev) => {
      const cell = prev[key] || { subject: "", teacherId: "", teacherName: "" };
      let newCell = { ...cell, [field]: value };
      if (field === "teacherId") {
        const t = displayStaff.find((s) => s.id === value);
        newCell.teacherName = t ? t.personal?.fullName : "";
      }
      return { ...prev, [key]: newCell };
    });
  };

  const handleSaveTimetable = async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "timetables", `${norm(selectedClass)}_${norm(selectedSection)}`), {
        classGrade: selectedClass,
        section: selectedSection,
        schedule: gridData,
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Error saving");
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
            <Clock className="text-primary-500" /> Time Table Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">Create schedules for all sections.</p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 border border-green-100 font-bold">
          <CheckCircle2 size={20} /> Saved successfully!
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex flex-wrap lg:flex-nowrap items-end justify-between gap-4">
          <div className="flex gap-4 w-full lg:w-auto">
            <div className="space-y-2 w-48">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection("");
                }}
                className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 font-bold focus:border-primary-500"
              >
                <option value="">-- Choose --</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 w-48">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="w-full bg-white outline-none rounded-xl px-4 py-3 text-sm border border-slate-200 font-bold disabled:opacity-50 focus:border-primary-500"
              >
                <option value="">-- Choose --</option>
                {availableSections.map((sec) => (
                  <option key={sec.id} value={sec.sectionName}>{sec.sectionName}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSaveTimetable}
            disabled={!selectedClass || !selectedSection || loading}
            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-700 shadow-md disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Schedule
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          {schoolPeriods.length === 0 ? (
            <div className="py-10 text-center">
              <AlertCircle size={40} className="mx-auto mb-2 text-orange-400" />
              <p className="font-bold text-slate-500">Configure periods in Admin Settings first.</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  <th className="bg-slate-800 text-white font-black uppercase text-xs p-4 border border-slate-700">Period</th>
                  {DAYS.map((day) => (
                    <th key={day} className="bg-slate-800 text-white font-black uppercase text-xs p-4 border border-slate-700">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schoolPeriods.map((period, idx) => (
                  <tr key={idx} className={period.name === "Break" ? "bg-orange-50" : ""}>
                    <td className="border border-slate-200 p-3 text-center bg-slate-50 font-black text-slate-600 text-sm">{period.name}</td>
                    {DAYS.map((day) => {
                      if (period.name === "Break")
                        return (
                          <td key={`${day}-${period.name}`} className="border border-orange-200 p-3 text-center">
                            <span className="text-orange-500 font-black text-xs uppercase tracking-[0.3em]">Recess</span>
                          </td>
                        );
                      const key = `${day}-${period.name}`;
                      const cell = gridData[key] || { subject: "", teacherId: "" };
                      return (
                        <td key={key} className="border border-slate-200 p-2 align-top">
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={cell.subject}
                              onChange={(e) => handleCellChange(day, period.name, "subject", e.target.value)}
                              placeholder="Subject"
                              className="w-full text-xs font-bold p-1.5 rounded-md border outline-none bg-slate-50"
                            />
                            <select
                              value={cell.teacherId}
                              onChange={(e) => handleCellChange(day, period.name, "teacherId", e.target.value)}
                              className="w-full text-[10px] font-bold p-1.5 rounded-md border outline-none bg-white"
                            >
                              <option value="">Teacher...</option>
                              {displayStaff.map((t) => (
                                <option key={t.id} value={t.id}>{t.personal?.fullName}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
