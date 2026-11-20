"use client";
import React, { useState, useMemo } from "react";
import { School, Plus, Trash2, Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses, useCreateClass, useDeleteClass, useUpdateClass } from "@/hooks/useClasses";
import { useAcademicYears } from "@/hooks/useAdmin";
import { useStudents } from "@/hooks/useStudents";
import { useStaff } from "@/hooks/useStaff";
import { useToast } from "@/components/ToastProvider";
import { formatClassLabel, cleanSectionName } from "@/lib/utils/formatClassLabel";

// 🛡️ Natural Sorting Logic (Prep, Class 1, Class 2, Class 10)
const sortClasses = (a: any, b: any) => {
  const nameA = String(a.classGrade || a.name || "").toLowerCase();
  const nameB = String(b.classGrade || b.name || "").toLowerCase();

  // Extract numbers from strings like "Class 10" -> 10
  const numA = parseInt(nameA.replace(/[^0-9]/g, ""), 10);
  const numB = parseInt(nameB.replace(/[^0-9]/g, ""), 10);

  if (nameA.includes("prep") || nameA.includes("play") || nameA.includes("nursery")) return -1;
  if (nameB.includes("prep") || nameB.includes("play") || nameB.includes("nursery")) return 1;

  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }
  
  return nameA.localeCompare(nameB);
};

export default function ClassesManagementPage() {
  const { data: sections = [], isLoading } = useClasses();
  const { data: academicYears = [] } = useAcademicYears();
  const activeAcademicYear = useMemo(() => {
    const current = (academicYears as any[]).find((ay: any) => ay.isCurrent);
    return current?.name || "2026-2027";
  }, [academicYears]);
  const { data: studentsData = [] } = useStudents();
  const students: any[] = Array.isArray(studentsData) ? studentsData : [];
  const { data: staffData = [] } = useStaff();
  const staffList: any[] = Array.isArray(staffData) ? staffData : [];
  const createMutation = useCreateClass();
  const deleteMutation = useDeleteClass();
  const updateMutation = useUpdateClass();
  const { showToast } = useToast();

  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");
  const [error, setError] = useState("");

  // Dynamic student counts
  const studentCounts = useMemo(() => {
    const classMap: Record<string, number> = {};
    const sectionMap: Record<string, number> = {};

    students.forEach((s: any) => {
      const cls = String(s.classGrade || s.class || "").replace(/^Class\s*/i, "").trim().toLowerCase();
      const sec = String(s.section || "").replace(/^Section\s*/i, "").trim().toLowerCase();

      if (cls) {
        classMap[cls] = (classMap[cls] || 0) + 1;
        if (sec) {
          const key = `${cls}__${sec}`;
          sectionMap[key] = (sectionMap[key] || 0) + 1;
        }
      }
    });

    return { classMap, sectionMap };
  }, [students]);

  // Group and Sort Data Enterprise Style
  const groupedSections = useMemo(() => {
    const groups: Record<string, any[]> = {};
    
    sections.forEach((section: any) => {
      // 🛡️ Deduplicate and normalize class name: "Class 1" through "Class 10"
      const clsName = formatClassLabel(section.classGrade || section.name);
      if (!clsName) return;
      
      if (!groups[clsName]) groups[clsName] = [];
      const secLetter = cleanSectionName(section.sectionName || section.section);

      const existingIndex = groups[clsName].findIndex(
        (s: any) => cleanSectionName(s.sectionName || s.section) === secLetter
      );

      if (existingIndex >= 0) {
        const curIncharge = section.incharge && section.incharge !== "Unassigned" && section.incharge !== "Not Assigned" && !section.incharge.startsWith("Test Staff");
        if (curIncharge) {
          groups[clsName][existingIndex] = section;
        }
      } else {
        groups[clsName].push(section);
      }
    });

    // Sort classes logically (Class 1 to Class 10)
    const sortedKeys = Object.keys(groups).sort(sortClasses);
    const sortedGroups: Record<string, any[]> = {};
    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key].sort((a: any, b: any) => {
        const secA = cleanSectionName(a.sectionName || a.section);
        const secB = cleanSectionName(b.sectionName || b.section);
        return secA.localeCompare(secB);
      });
    });

    return sortedGroups;
  }, [sections]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass || !newSection) {
      setError("Please enter both Class and Section.");
      return;
    }

    const normGrade = newClass.trim().replace(/^Class\s+/i, "Class ");
    const finalGrade = normGrade.startsWith("Class ") ? normGrade : `Class ${normGrade}`;
    const finalSection = newSection.trim().replace(/^Section\s+/i, "").toUpperCase();

    // 🛡️ Duplicate Prevention
    const exists = sections.some((s: any) => {
      const sCls = String(s.classGrade || s.name || "").replace(/^Class\s+/i, "").trim().toLowerCase();
      const sSec = String(s.sectionName || s.section || "").replace(/^Section\s+/i, "").trim().toLowerCase();
      const targetCls = finalGrade.replace(/^Class\s+/i, "").trim().toLowerCase();
      const targetSec = finalSection.toLowerCase();
      return sCls === targetCls && sSec === targetSec;
    });

    if (exists) {
      setError(`Section ${finalSection} for ${finalGrade} already exists.`);
      showToast("Section already exists!", "error");
      return;
    }

    setError("");
    createMutation.mutate(
      { classGrade: finalGrade, sectionName: finalSection },
      {
        onSuccess: () => {
          showToast(`Section ${finalSection} added to ${finalGrade} successfully!`, "success");
          setNewClass("");
          setNewSection("");
        },
        onError: () => setError("Failed to add section."),
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure? This will archive the section.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 border-b pb-2">
              <School className="text-blue-600"/> Academic Structure
            </h1>
            <p className="text-sm text-gray-500 mt-2">Manage Classes, Sections, and Academic Hierarchy.</p>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 font-bold border border-red-100"><AlertCircle size={20}/> {error}</div>}

        {/* Enterprise Add Form with Dropdowns */}
        <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Plus size={20} className="text-blue-500"/> Add New Section</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class Input Field (Admin can type their own class name) */}
              <input 
                type="text"
                placeholder="Enter Class Name (e.g., Class 4)"
                value={newClass} 
                onChange={e => setNewClass(e.target.value)} 
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              {/* Section Input Field (Admin can type their own section name) */}
              <input 
                type="text"
                placeholder="Enter Section Name (e.g., A, Morning)"
                value={newSection} 
                onChange={e => setNewSection(e.target.value)} 
                className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              
              <button 
                type="submit" 
                disabled={createMutation.isPending} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 py-3"
              >
                {createMutation.isPending ? <Loader2 className="animate-spin"/> : <CheckCircle size={18}/>} Save Section
              </button>
            </form>
          </div>
        </RequirePermission>

        {/* Enterprise Card Layout */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <School className="text-gray-600" size={20}/>
            <h2 className="font-bold text-gray-800">Active Academic Structure</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32}/></div>
          ) : Object.keys(groupedSections).length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold">No classes found. Add one above.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedSections).map(([className, sectionsList]: any) => {
                // Clean display name
                const displayName = formatClassLabel(className);
                const normCls = className.replace(/^Class\s*/i, "").trim().toLowerCase();
                const dynamicTotal = studentCounts.classMap[normCls] ?? 0;
                const totalStudents = dynamicTotal > 0 ? dynamicTotal : sectionsList.reduce((sum: number, sec: any) => sum + (sec.studentCount || 0), 0);

                return (
                  <div key={className} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                      <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{displayName}</h3>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500 font-medium">
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Punjab Board</span>
                          <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded">English Medium</span>
                          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{activeAcademicYear}</span>
                        </div>
                      </div>
                      <div className="text-right mt-2 md:mt-0">
                        <p className="text-sm font-bold text-gray-700 flex items-center gap-1 justify-end">
                          <Users size={14} /> {totalStudents} Students
                        </p>
                        <p className="text-xs text-gray-400">{sectionsList.length} Sections</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {sectionsList.map((sec: any) => {
                        const secName = cleanSectionName(sec.sectionName || sec.section);
                        const normSec = secName.toLowerCase();
                        const dynamicSecCount = studentCounts.sectionMap[`${normCls}__${normSec}`] ?? 0;
                        const displaySecCount = dynamicSecCount > 0 ? dynamicSecCount : (sec.studentCount || 0);

                        // Resolve real assigned staff member (e.g. ghzandar Ali)
                        const rawIncharge = (sec.incharge || sec.classTeacherName || "").trim();
                        const matchedStaff = staffList.find((st: any) => {
                          if (st.deleted) return false;
                          if (sec.classTeacherId && st.id === sec.classTeacherId) return true;
                          const sName = (st.name || st.fullName || st.personal?.fullName || `${st.firstName || ""} ${st.lastName || ""}`.trim()).trim().toLowerCase();
                          if (rawIncharge && rawIncharge.toLowerCase() === sName && !rawIncharge.startsWith("Test Staff")) return true;

                          // Match by staff academic class & section assignment
                          const classes = st.academic?.classesAssigned || st.classesAssigned || st.professional?.classesAssigned || [];
                          const assignedSection = cleanSectionName(st.academic?.sectionAssignment || st.sectionAssignment || "");
                          const matchesClass = Array.isArray(classes) && classes.some((c: string) => formatClassLabel(c) === displayName);
                          const matchesSection = !assignedSection || assignedSection === secName;
                          return matchesClass && matchesSection;
                        });
                        const isAssigned = Boolean(matchedStaff);

                        return (
                          <div 
                            key={sec.id} 
                            className={`bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col justify-between group ${deleteMutation.isPending && deleteMutation.variables === sec.id ? 'opacity-50' : ''}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-gray-700 text-sm">Section {secName}</span>
                              <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
                                <button 
                                  onClick={() => handleDelete(sec.id)} 
                                  disabled={deleteMutation.isPending} 
                                  className="text-gray-300 hover:text-red-500 transition disabled:opacity-50 p-1"
                                >
                                  {deleteMutation.isPending && deleteMutation.variables === sec.id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                                </button>
                              </RequirePermission>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1.5">
                              <p>Students: <span className="font-bold text-blue-600">{displaySecCount}</span></p>
                              <div className="flex items-center justify-between gap-1 flex-wrap">
                                <span className="text-gray-500">Teacher:</span>
                                {isAssigned ? (
                                  <a 
                                    href={`/staff-profile?id=${sec.classTeacherId || matchedStaff?.id}`}
                                    className="text-blue-600 hover:underline font-bold truncate max-w-[110px]"
                                    title={matchedStaff?.fullName || matchedStaff?.name || sec.incharge}
                                  >
                                    {matchedStaff?.fullName || matchedStaff?.name || sec.incharge}
                                  </a>
                                ) : (
                                  <span className="text-amber-600 font-semibold">Unassigned</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100">
                                <span className="text-[11px] text-gray-400">Assign:</span>
                                <select
                                  value={matchedStaff ? matchedStaff.id : ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (!val || val === "__unassign__") {
                                      updateMutation.mutate({
                                        id: sec.id,
                                        incharge: "Unassigned",
                                        classTeacherName: "Unassigned",
                                        classTeacherId: null,
                                      });
                                    } else {
                                      const st = staffList.find((s: any) => s.id === val);
                                      if (st) {
                                        const stName = st.name || st.fullName || `${st.firstName || ""} ${st.lastName || ""}`.trim();
                                        updateMutation.mutate({
                                          id: sec.id,
                                          incharge: stName,
                                          classTeacherName: stName,
                                          classTeacherId: st.id,
                                        });
                                      }
                                    }
                                  }}
                                  disabled={updateMutation.isPending}
                                  className="text-[11px] bg-white border border-gray-200 rounded px-1 py-0.5 font-medium text-gray-700 outline-none hover:border-blue-400 transition"
                                  title="Assign Faculty Incharge"
                                >
                                  <option value="">{isAssigned ? "Change..." : "Select..."}</option>
                                  {staffList.filter((s: any) => !s.deleted).map((s: any) => {
                                    const sName = s.name || s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim();
                                    return <option key={s.id} value={s.id}>{sName}</option>;
                                  })}
                                  {isAssigned && <option value="__unassign__">Unassign</option>}
                                </select>
                              </div>
                              <p>Capacity: <span className="font-medium text-gray-600">{sec.capacity || 30}</span></p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RequirePermission>
  );
}
