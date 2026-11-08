// app/(protected)/students/page.tsx
"use client";
import { useState, useMemo } from "react";
import { useStudents, useDeleteStudent } from "@/hooks/useStudents";
import { useAuth } from "@/context/AuthContext";
import { 
  AlertTriangle, 
  Loader2, 
  Users, 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Eye, 
  Search, 
  Download, 
  Filter 
} from "lucide-react";
import Link from "next/link";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import EditStudentModal from "@/components/students/EditStudentModal";
import { useToast } from "@/components/ToastProvider";

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: students, isLoading, error } = useStudents();
  const deleteMutation = useDeleteStudent();
  const { showToast } = useToast();
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedSection, setSelectedSection] = useState("ALL");

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast(`${name} deleted successfully!`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to delete student", "error");
    }
  };

  // Derive unique classes and sections for filters
  const { availableClasses, availableSections } = useMemo(() => {
    if (!students || !Array.isArray(students)) return { availableClasses: [], availableSections: [] };
    const classes = new Set<string>();
    const sections = new Set<string>();

    students.forEach((s: any) => {
      const c = String(s.classGrade || s.class || "").trim();
      const sec = String(s.section || "").trim();
      if (c) classes.add(c);
      if (sec) sections.add(sec);
    });

    return {
      availableClasses: Array.from(classes).sort(),
      availableSections: Array.from(sections).sort(),
    };
  }, [students]);

  // Filtered and numerically sorted students
  const filteredStudents = useMemo(() => {
    if (!students || !Array.isArray(students)) return [];

    return students
      .filter((s: any) => {
        // Search filter
        const name = String(s.fullName || s.name || "").toLowerCase();
        const roll = String(s.rollNumber || "").toLowerCase();
        const guardian = String(s.guardianName || s.fatherName || "").toLowerCase();
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch = !term || name.includes(term) || roll.includes(term) || guardian.includes(term);

        // Class filter
        const sClass = String(s.classGrade || s.class || "").trim();
        const matchesClass = selectedClass === "ALL" || sClass.toLowerCase() === selectedClass.toLowerCase();

        // Section filter
        const sSec = String(s.section || "").trim();
        const matchesSection = selectedSection === "ALL" || sSec.toLowerCase() === selectedSection.toLowerCase();

        return matchesSearch && matchesClass && matchesSection;
      })
      .sort((a: any, b: any) => {
        const rollA = Number(String(a.rollNumber || "").replace(/\D/g, "")) || 0;
        const rollB = Number(String(b.rollNumber || "").replace(/\D/g, "")) || 0;
        if (rollA !== rollB) return rollA - rollB;
        const nameA = String(a.fullName || a.name || "").toLowerCase();
        const nameB = String(b.fullName || b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [students, searchTerm, selectedClass, selectedSection]);

  // CSV Export
  const handleExportCSV = () => {
    if (!filteredStudents.length) {
      showToast("No students to export.", "error");
      return;
    }
    const headers = ["Roll No", "Full Name", "Class", "Section", "Guardian Name", "Guardian Phone", "Status"];
    const rows = filteredStudents.map((s: any) => [
      `"${s.rollNumber || ""}"`,
      `"${s.fullName || s.name || ""}"`,
      `"${s.classGrade || s.class || ""}"`,
      `"${s.section || ""}"`,
      `"${s.guardianName || s.fatherName || ""}"`,
      `"${s.guardianPhone || s.parentPhone || ""}"`,
      `"${s.status || "active"}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Students exported successfully!", "success");
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading students...</p>
      </div>
    );
  }

  if (error || !students) {
    return (
      <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-red-600">Could not load students.</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          There was an issue connecting to the Student Repository. Please check your network connection or ensure the database indexes are created in Firebase.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-1">
            <Users className="text-blue-600" /> Students Directory
          </h1>
          <p className="text-sm text-gray-500">
            Manage student admissions, profiles, and records. ({filteredStudents.length} of {students.length} students)
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm"
            title="Export to CSV"
          >
            <Download size={18} className="text-gray-500" /> Export CSV
          </button>
          <RequirePermission permissions={[PERMISSIONS.students.create]}>
            <Link 
              href="/students/add" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm"
            >
              <PlusCircle size={18} /> Add Student
            </Link>
          </RequirePermission>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by student name, roll number, or guardian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-1.5 min-w-[130px]">
            <Filter size={16} className="text-gray-400 shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Classes</option>
              {availableClasses.map((c) => (
                <option key={c} value={c}>{c.startsWith("Class ") ? c : `Class ${c}`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 min-w-[130px]">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Sections</option>
              {availableSections.map((sec) => (
                <option key={sec} value={sec}>{sec.startsWith("Section ") ? sec : `Section ${sec}`}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 font-medium shadow-sm">
          <Users className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-bold text-gray-600 mb-1">No students found</h3>
          <p className="text-sm">Add students manually or use bulk import to get started.</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 font-medium shadow-sm">
          <Search className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-lg font-bold text-gray-600 mb-1">No matching students</h3>
          <p className="text-sm">No students match your filter criteria. Try adjusting the search term or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Roll No</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Name</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Class</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider">Section</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider hidden md:table-cell">Guardian</th>
                  <th className="p-4 font-bold text-gray-600 text-sm uppercase tracking-wider hidden md:table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-700 font-bold">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                        #{s.rollNumber || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      <Link href={`/students/${s.id}`} className="hover:text-blue-600 hover:underline">
                        {s.fullName || s.name || "N/A"}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600 font-medium">{s.classGrade || "N/A"}</td>
                    <td className="p-4 text-gray-600 font-medium">{s.section || "N/A"}</td>
                    <td className="p-4 text-gray-600 font-medium hidden md:table-cell">{s.guardianName || s.fatherName || "N/A"}</td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/students/${s.id}`}
                          className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1 hover:underline p-1.5 rounded-lg hover:bg-blue-50 transition"
                          title="View Profile"
                        >
                          <Eye size={15} /> View
                        </Link>
                        <RequirePermission permissions={[PERMISSIONS.students.update]}>
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 p-1.5 rounded-lg hover:bg-indigo-50 transition"
                            title="Edit Student"
                          >
                            <Pencil size={15} /> Edit
                          </button>
                        </RequirePermission>
                        <RequirePermission permissions={[PERMISSIONS.students.delete]}>
                          <button
                            onClick={() => handleDelete(s.id, s.fullName || s.name || "Student")}
                            className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1 p-1.5 rounded-lg hover:bg-red-50 transition"
                            title="Delete Student"
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </RequirePermission>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingStudent && (
        <EditStudentModal
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          student={editingStudent}
        />
      )}
    </div>
  );
}
