"use client";
import { useState, useMemo } from "react";
import { Users, ArrowUpRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStudents } from "@/hooks/useStudents";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ToastProvider";

const CLASS_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTION_OPTIONS = ["A", "B", "C", "D", "E"];

export default function PromoteStudentsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [fromClass, setFromClass] = useState("");
  const [toClass, setToClass] = useState("");
  const [toSection, setToSection] = useState("A");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<{ promoted: number; errors: string[] } | null>(null);

  // Fetch students
  const { data: studentsData, isLoading } = useStudents();
  const students: any[] = Array.isArray(studentsData) ? studentsData : [];

  // Filter students by fromClass
  const eligibleStudents = useMemo(() => {
    if (!fromClass) return [];
    return students.filter(s => s.classGrade === fromClass && (s.status || "active") === "active" && !s.deleted);
  }, [students, fromClass]);

  // Promotion mutation
  const promoteMutation = useMutation({
    mutationFn: async (data: { studentIds: string[]; newClassGrade: string; newSection: string; academicYear: string }) => {
      const res = await apiClient.post("/students/promote", data);
      return res.data as { promoted: number; errors: string[] };
    },
    onSuccess: (data) => {
      setResult(data);
      showToast(`Successfully promoted ${data.promoted} students!`, "success");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setSelectedIds(new Set());
    },
    onError: () => {
      showToast("Failed to promote students.", "error");
    },
  });

  // Toggle selection
  const toggleAll = () => {
    if (selectedIds.size === eligibleStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleStudents.map(s => s.id)));
    }
  };

  const toggleStudent = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handlePromote = () => {
    if (selectedIds.size === 0) {
      showToast("Select at least one student to promote.", "error");
      return;
    }
    if (!toClass) {
      showToast("Select target class.", "error");
      return;
    }
    if (!confirm(`Promote ${selectedIds.size} students to Class ${toClass} Section ${toSection}?`)) return;
    promoteMutation.mutate({
      studentIds: Array.from(selectedIds),
      newClassGrade: toClass,
      newSection: toSection,
      academicYear,
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <ArrowUpRight className="text-blue-600" size={28} /> Promote Students
      </h1>

      {/* Promotion Config */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-gray-800">Promotion Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">From Class</label>
            <select value={fromClass} onChange={e => { setFromClass(e.target.value); setSelectedIds(new Set()); setResult(null); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select class</option>
              {CLASS_OPTIONS.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">To Class</label>
            <select value={toClass} onChange={e => setToClass(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select class</option>
              {CLASS_OPTIONS.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">To Section</label>
            <select value={toSection} onChange={e => setToSection(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Academic Year</label>
            <input type="text" value={academicYear} onChange={e => setAcademicYear(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="2025-2026" />
          </div>
        </div>
      </div>

      {/* Student Selection */}
      {fromClass && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800">Eligible Students ({eligibleStudents.length})</h3>
              <p className="text-sm text-gray-500">Class {fromClass} - Active students</p>
            </div>
            {eligibleStudents.length > 0 && (
              <button onClick={toggleAll} className="text-sm text-blue-600 font-bold hover:underline">
                {selectedIds.size === eligibleStudents.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
          ) : eligibleStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Users className="mx-auto mb-2 text-gray-300" size={32} />
              <p>No active students found in Class {fromClass}</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                  <tr>
                    <th className="p-3 w-10"></th>
                    <th className="p-3 text-left font-bold text-gray-500 text-xs uppercase">Name</th>
                    <th className="p-3 text-left font-bold text-gray-500 text-xs uppercase">Roll No</th>
                    <th className="p-3 text-left font-bold text-gray-500 text-xs uppercase">Father Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {eligibleStudents.map(s => (
                    <tr key={s.id} className={`hover:bg-gray-50 cursor-pointer ${selectedIds.has(s.id) ? "bg-blue-50" : ""}`} onClick={() => toggleStudent(s.id)}>
                      <td className="p-3">
                        <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleStudent(s.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="p-3 font-medium text-gray-800">{s.fullName}</td>
                      <td className="p-3 text-gray-600">{s.rollNumber}</td>
                      <td className="p-3 text-gray-600">{s.fatherName || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Action + Result */}
      <div className="space-y-4">
        <RequirePermission permissions={[PERMISSIONS.students.update]}>
          <button
            onClick={handlePromote}
            disabled={promoteMutation.isPending || selectedIds.size === 0 || !toClass}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl flex items-center justify-center gap-2 font-black shadow-md transition disabled:opacity-50 text-lg w-full md:w-auto"
          >
            {promoteMutation.isPending ? <Loader2 className="animate-spin" size={24} /> : <ArrowUpRight size={24} />}
            {promoteMutation.isPending ? "Processing..." : `Promote ${selectedIds.size} Student${selectedIds.size !== 1 ? "s" : ""}`}
          </button>
        </RequirePermission>

        {result && (
          <div className={`rounded-xl p-4 border ${result.errors.length > 0 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.errors.length === 0 ? <CheckCircle2 className="text-green-600" size={18} /> : <AlertCircle className="text-yellow-600" size={18} />}
              <p className="font-bold text-gray-800">Promotion Complete</p>
            </div>
            <p className="text-sm text-gray-600">Successfully promoted {result.promoted} students.</p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-red-600 font-medium">{result.errors.length} errors:</p>
                <ul className="text-xs text-red-500 mt-1 space-y-1">
                  {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
