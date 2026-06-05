export const dynamic = 'force-dynamic';
"use client";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  Users, Layers, BookOpen, ChevronRight, ArrowLeft,
  Search, Eye, GraduationCap, Loader2, X
} from "lucide-react";
import Link from "next/link";

const norm = (str?: string) => (str || "").trim().toLowerCase();

// --- Modal components unchanged (same as before) ---
function ClassModal({ classGrade, sections, studentsBySection, onClose, onSectionClick, onStudentClick }: {
  classGrade: string;
  sections: any[];
  studentsBySection: Record<string, any[]>;
  onClose: () => void;
  onSectionClick: (section: any) => void;
  onStudentClick: (student: any) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-black">{classGrade} - Sections</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={24} /></button>
        </div>
        <div className="p-4 space-y-4">
          {sections.length === 0 ? (
            <p className="text-center text-slate-400">No sections found.</p>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="border rounded-xl p-4 hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">Section {section.sectionName}</h3>
                    <p className="text-sm text-slate-500">Students: {studentsBySection[section.sectionName]?.length || 0}</p>
                    <p className="text-xs text-slate-400">Incharge: {section.incharge || "Not assigned"}</p>
                  </div>
                  <button
                    onClick={() => onSectionClick(section)}
                    className="bg-primary text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/80"
                  >
                    View Students
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SectionModal({ section, students, onClose, onStudentClick }: {
  section: any;
  students: any[];
  onClose: () => void;
  onStudentClick: (student: any) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-black">{section.classGrade} - Section {section.sectionName}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={24} /></button>
        </div>
        <div className="p-4">
          {students.length === 0 ? (
            <p className="text-center text-slate-400">No students in this section.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {students.sort((a,b) => (a.rollNumber || 0) - (b.rollNumber || 0)).map((student) => (
                <div key={student.id} className="border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => onStudentClick(student)}>
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                    {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" /> : <Users size={20} className="m-2 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{student.name}</p>
                    <p className="text-xs text-slate-500">Roll No: {student.rollNumber}</p>
                  </div>
                  <Eye size={18} className="text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentSummaryModal({ student, onClose }: { student: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-slate-800 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-black">Student Profile</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={24} /></button>
        </div>
        <div className="p-6 space-y-4 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 overflow-hidden">
            {student.photoBase64 ? <img src={student.photoBase64} className="w-full h-full object-cover" /> : <Users size={40} className="m-4 text-slate-400" />}
          </div>
          <h3 className="text-2xl font-black">{student.name}</h3>
          <p className="text-slate-600">Father: {student.fatherName || "N/A"}</p>
          <p className="text-slate-600">Roll No: {student.rollNumber}</p>
          <p className="text-slate-600">Class: {student.classGrade} - {student.section}</p>
          <button
            onClick={() => window.location.href = `/student-profile?id=${student.id}`}
            className="mt-4 bg-primary text-gray-900 px-6 py-2 rounded-xl font-bold hover:bg-primary/80 w-full"
          >
            View Full Profile →
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- Main Classes Page --------------------
export default function ClassesDirectoryPage() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [approvedClasses, setApprovedClasses] = useState<string[]>([]); // Classes from settings
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Load approved classes from settings
  useEffect(() => {
    if (!user?.tenantId) return;
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        const classes = data.classes || [];
        setApprovedClasses(classes);
      })
      .catch(console.error)
      .finally(() => setLoadingSettings(false));
  }, [user?.tenantId]);

  // Listen to sections and students
  useEffect(() => {
    setIsMounted(true);
    if (!user?.tenantId) return;

    const unsubSections = onSnapshot(
      query(collection(db, "sections"), where("tenantId", "==", user.tenantId)),
      (snapshot) => setSections(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const unsubStudents = onSnapshot(
      query(collection(db, "students"), where("tenantId", "==", user.tenantId)),
      (snapshot) => setAllStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { unsubSections(); unsubStudents(); };
  }, [user?.tenantId]);

  // Get sections for a class (only those that belong to formal sections + auto-synced from students)
  const getSectionsForClass = (cls: string) => {
    const formalSections = sections.filter(s => norm(s.classGrade) === norm(cls));
    const studentSections = Array.from(new Set(
      allStudents.filter(s => norm(s.classGrade) === norm(cls)).map(s => s.section || "Unassigned")
    ));
    const merged = [...formalSections];
    studentSections.forEach(secName => {
      if (!secName || norm(secName) === "unassigned") return;
      if (!merged.find(m => norm(m.sectionName) === norm(secName))) {
        merged.push({ id: `auto-${secName}`, classGrade: cls, sectionName: secName, incharge: "Auto-Synced" });
      }
    });
    return merged;
  };

  const getStudentsForSection = (cls: string, sec: string) =>
    allStudents.filter(s => norm(s.classGrade) === norm(cls) && norm(s.section) === norm(sec));

  const getStudentsBySection = (cls: string) => {
    const map: Record<string, any[]> = {};
    const secs = getSectionsForClass(cls);
    secs.forEach(sec => {
      map[sec.sectionName] = getStudentsForSection(cls, sec.sectionName);
    });
    return map;
  };

  // Show only classes that are in the approved list from settings
  const activeClasses = approvedClasses.filter(cls =>
    getSectionsForClass(cls).length > 0 || allStudents.filter(s => norm(s.classGrade) === norm(cls)).length > 0
  );

  const bgColors = ["bg-primary", "bg-accent", "bg-secondary", "bg-success", "bg-warning", "bg-info"];

  // Handlers
  const handleClassClick = (cls: string) => {
    setSelectedClass(cls);
    setShowClassModal(true);
  };
  const handleSectionClick = (section: any) => {
    setSelectedSection(section);
    setShowClassModal(false);
    setShowSectionModal(true);
  };
  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setShowSectionModal(false);
    setShowStudentModal(true);
  };
  const closeAllModals = () => {
    setShowClassModal(false);
    setShowSectionModal(false);
    setShowStudentModal(false);
    setSelectedClass(null);
    setSelectedSection(null);
    setSelectedStudent(null);
  };

  if (!isMounted || loadingSettings) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-extrabold flex items-center gap-3">
          <Layers className="text-success" /> Academic Directory
        </h1>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-xl pl-10 pr-4 py-2 text-sm border shadow-sm"
          />
        </div>
      </div>

      {searchQuery ? (
        <div className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent p-4 text-gray-900">
            <h2 className="font-bold">Search Results</h2>
          </div>
          <div className="divide-y divide-white/10">
            {allStudents
              .filter(s => norm(s.name).includes(norm(searchQuery)))
              .map(s => (
                <div
                  key={s.id}
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5"
                  onClick={() => {
                    setSelectedStudent(s);
                    setShowStudentModal(true);
                  }}
                >
                  <div>
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-sm text-slate-500">{s.classGrade} - {s.section}</p>
                  </div>
                  <button className="text-primary">View</button>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeClasses.map((cls, idx) => {
            const classSections = getSectionsForClass(cls);
            const classStudents = allStudents.filter(s => norm(s.classGrade) === norm(cls));
            const colorClass = bgColors[idx % bgColors.length];
            return (
              <div
                key={cls}
                onClick={() => handleClassClick(cls)}
                className="glass-card p-6 cursor-pointer group hover:shadow-glass-hover transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center text-gray-900 shadow-md`}>
                    <BookOpen size={24} />
                  </div>
                  <div className="bg-white/10 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full">Open</div>
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-1">{cls}</h3>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/20">
                  <span className="flex justify-between text-sm font-bold">
                    <span><Layers size={16} className="inline mr-1" /> Sections</span>
                    <span className="bg-white/20 px-2 rounded-lg">{classSections.length}</span>
                  </span>
                  <span className="flex justify-between text-sm font-bold">
                    <span><Users size={16} className="inline mr-1" /> Students</span>
                    <span className="bg-white/20 px-2 rounded-lg">{classStudents.length}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showClassModal && selectedClass && (
        <ClassModal
          classGrade={selectedClass}
          sections={getSectionsForClass(selectedClass)}
          studentsBySection={getStudentsBySection(selectedClass)}
          onClose={closeAllModals}
          onSectionClick={handleSectionClick}
          onStudentClick={(student) => {
            setSelectedStudent(student);
            setShowClassModal(false);
            setShowStudentModal(true);
          }}
        />
      )}
      {showSectionModal && selectedSection && (
        <SectionModal
          section={selectedSection}
          students={getStudentsForSection(selectedSection.classGrade, selectedSection.sectionName)}
          onClose={closeAllModals}
          onStudentClick={handleStudentClick}
        />
      )}
      {showStudentModal && selectedStudent && (
        <StudentSummaryModal student={selectedStudent} onClose={closeAllModals} />
      )}
    </div>
  );
}
