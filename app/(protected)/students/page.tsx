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
  Filter,
  Upload,
  X,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import EditStudentModal from "@/components/students/EditStudentModal";
import { useToast } from "@/components/ToastProvider";
import { formatClassLabel } from "@/lib/utils/formatClassLabel";
import * as XLSX from "xlsx";

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: students, isLoading, error } = useStudents();
  const deleteMutation = useDeleteStudent();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedSection, setSelectedSection] = useState("ALL");

  // Bulk Import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const downloadSampleTemplate = () => {
    const headers = ["Roll No", "Full Name", "Father Name", "Class", "Section", "Gender", "DOB", "Guardian Name", "Guardian Relation", "Guardian Phone", "Monthly Fee"];
    const sampleRows = [
      ["1", "Muhammad Ali", "Ahmed Ali", "Class 1", "A", "Male", "2018-03-15", "Ahmed Ali", "Father", "03001234567", "5000"],
      ["2", "Fatima Zahra", "Tariq Mahmood", "Class 1", "A", "Female", "2018-05-20", "Tariq Mahmood", "Father", "03011234567", "5000"]
    ];
    const csvContent = [headers.join(","), ...sampleRows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_import_template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBulkFile(file);
    setBulkMessage(null);
    setPreviewRows([]);
    setPreviewErrors([]);

    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      const valid: any[] = [];
      const errs: string[] = [];

      data.forEach((row, idx) => {
        const name = row["Full Name"] || row["fullName"] || row["Name"] || row["Student Name"];
        const cls = row["Class"] || row["classGrade"] || row["Grade"] || row["Class / Grade"];
        if (!name || String(name).trim().length < 2) {
          errs.push(`Row ${idx + 2}: Full Name is required`);
        } else if (!cls) {
          errs.push(`Row ${idx + 2} ("${name}"): Class is required`);
        } else {
          valid.push(row);
        }
      });

      setPreviewRows(valid);
      setPreviewErrors(errs);
    } catch {
      setBulkMessage({ type: "error", text: "Could not read file. Ensure it is a valid CSV or Excel file." });
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      setBulkMessage({ type: "error", text: "Please select a file first." });
      return;
    }
    setUploading(true);
    setBulkMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const res = await fetch("/api/v1/students/bulk", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        showToast(`Successfully imported ${json.count ?? json.imported ?? 0} students!`, "success");
        setBulkMessage({ type: "success", text: `Imported ${json.count ?? json.imported ?? 0} students!` });
        queryClient.invalidateQueries({ queryKey: ["students"] });
        setTimeout(() => {
          setShowBulkModal(false);
          setBulkFile(null);
          setPreviewRows([]);
          setPreviewErrors([]);
          setBulkMessage(null);
        }, 1500);
      } else {
        setBulkMessage({ type: "error", text: json.message || "Bulk import failed." });
      }
    } catch {
      setBulkMessage({ type: "error", text: "Network error occurred during upload." });
    } finally {
      setUploading(false);
    }
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
            <button
              onClick={() => { setShowBulkModal(true); setBulkFile(null); setBulkMessage(null); setPreviewRows([]); setPreviewErrors([]); }}
              className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm"
              title="Import Students from CSV or Excel"
            >
              <Upload size={18} className="text-blue-600" /> Import Students
            </button>
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
                <option key={c} value={c}>{formatClassLabel(c)}</option>
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

      {/* Student Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(null); setPreviewRows([]); setPreviewErrors([]); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Upload size={22} className="text-blue-600" /> Student Bulk Import
            </h2>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file with student admission records. Required columns: <em>Full Name</em> and <em>Class</em>. Optional: <em>Roll No</em>, <em>Section</em> (defaults to A), <em>Father Name</em>, <em>Gender</em>, <em>DOB</em>, <em>Guardian Phone</em>, <em>Monthly Fee</em>.
            </p>

            <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
              <span className="text-xs text-blue-900 font-medium">Download standard format:</span>
              <button
                onClick={downloadSampleTemplate}
                type="button"
                className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-white border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition"
              >
                <Download size={14} /> Download Template (.csv)
              </button>
            </div>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer mb-4 border border-dashed border-gray-300 p-2 rounded-xl"
            />

            {/* Validation & Preview Summary */}
            {bulkFile && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-xs font-bold px-1">
                  <span className="text-gray-700">Preview Summary:</span>
                  <span className={previewRows.length > 0 ? "text-green-600 font-black" : "text-gray-500"}>
                    {previewRows.length} valid records ready
                  </span>
                </div>

                {previewErrors.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1 max-h-32 overflow-y-auto">
                    <div className="font-bold flex items-center gap-1 text-amber-900">
                      <AlertTriangle size={14} /> {previewErrors.length} validation issues found:
                    </div>
                    {previewErrors.map((err, i) => (
                      <div key={i} className="text-amber-700 pl-4 list-disc">• {err}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {bulkMessage && (
              <div className={`flex items-start gap-2 p-3 rounded-xl text-xs font-bold mb-4 ${bulkMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
                {bulkMessage.type === "success" ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
                <span>{bulkMessage.text}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(null); setPreviewRows([]); setPreviewErrors([]); }}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={uploading || !bulkFile || previewRows.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 text-sm"
              >
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                {uploading ? "Importing..." : `Import ${previewRows.length > 0 ? `${previewRows.length} ` : ""}Students`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
