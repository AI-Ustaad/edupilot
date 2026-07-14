"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2, UserPlus, Upload, Loader2, FileText, AlertCircle,
  Search, Filter, ChevronLeft, ChevronRight, Download, Archive,
  Eye, ArrowUpDown, CheckSquare, Square, X,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useStudents, useDeleteStudent, useBulkStudents } from "@/hooks/useStudents";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useToast } from "@/components/ToastProvider";
import { TableSkeleton } from "@/components/Skeletons";
import Image from "next/image";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  graduated: "bg-blue-50 text-blue-700 border-blue-200",
  transferred: "bg-gray-50 text-gray-700 border-gray-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-yellow-50 text-yellow-700 border-yellow-200",
  dropped: "bg-orange-50 text-orange-700 border-orange-200",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  graduated: "Graduated",
  transferred: "Transferred",
  suspended: "Suspended",
  archived: "Archived",
  dropped: "Dropped",
};

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ocrUploading, setOcrUploading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sorting
  const [sortField, setSortField] = useState("rollNumber");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // 1. Fetch Students
  const { data: studentsData, isLoading: isStudentsLoading, isError } = useStudents();
  const students: any[] = Array.isArray(studentsData) ? studentsData : [];

  // 2. Delete Mutation
  const deleteMutation = useDeleteStudent();
  const bulkMutation = useBulkStudents();
  const { showToast } = useToast();

  // 3. Client-side filtering + sorting
  const filteredStudents = useMemo(() => {
    let result = students.filter(s => {
      if (s.deleted && !s.status) return false;
      if (statusFilter && (s.status || "active") !== statusFilter) return false;
      if (classFilter && s.classGrade !== classFilter) return false;
      if (sectionFilter && s.section !== sectionFilter) return false;
      if (genderFilter && s.gender !== genderFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matches =
          s.fullName?.toLowerCase().includes(q) ||
          s.fatherName?.toLowerCase().includes(q) ||
          String(s.rollNumber).includes(q) ||
          s.admissionNumber?.includes(q) ||
          s.phone?.includes(q) ||
          s.cnic?.includes(q);
        if (!matches) return false;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") return (aVal - bVal) * (sortDir === "desc" ? -1 : 1);
      return String(aVal).localeCompare(String(bVal)) * (sortDir === "desc" ? -1 : 1);
    });

    return result;
  }, [students, searchQuery, statusFilter, classFilter, sectionFilter, genderFilter, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Unique values for filters
  const uniqueClasses = useMemo(() => [...new Set(students.map(s => s.classGrade).filter(Boolean))].sort(), [students]);
  const uniqueSections = useMemo(() => [...new Set(students.map(s => s.section).filter(Boolean))].sort(), [students]);

  // Selection
  const allSelected = paginatedStudents.length > 0 && paginatedStudents.every(s => selectedIds.has(s.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedStudents.map(s => s.id)));
    }
  };
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  // Sort toggle
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ["Name", "Father Name", "Class", "Section", "Roll No", "Admission No", "Phone", "Status"];
    const rows = filteredStudents.map(s => [
      s.fullName, s.fatherName, s.classGrade, s.section, s.rollNumber, s.admissionNumber, s.phone, s.status || "active"
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredStudents]);

  // Bulk actions
  const handleBulkArchive = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Archive ${selectedIds.size} students?`)) return;
    bulkMutation.mutate({ action: "archive", ids: Array.from(selectedIds) });
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} students? This cannot be undone.`)) return;
    bulkMutation.mutate({ action: "delete", ids: Array.from(selectedIds) });
    setSelectedIds(new Set());
  };

  // CSV Import
  const handleImportCSV = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/students/bulk", { method: "POST", body: formData });
      if (res.ok) {
        showToast("Students imported successfully!", "success");
      } else {
        showToast("Import failed", "error");
      }
    };
    input.click();
  };

  // OCR Upload
  const handleOCRUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf,.docx";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      setOcrUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/v1/students/ocr-admission", { method: "POST", body: formData });
        const result = await res.json();
        if (result.success && result.data) {
          sessionStorage.setItem("ocrStudentData", JSON.stringify(result.data));
          router.push("/students/add?ocr=true");
        } else {
          showToast(result.error || "Failed to extract data", "error");
        }
      } catch (err) {
        showToast("OCR processing failed.", "error");
      } finally {
        setOcrUploading(false);
      }
    };
    input.click();
  };

  if (authLoading || isStudentsLoading) {
    return <div className="p-8"><TableSkeleton rows={8} cols={6} /></div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center flex flex-col justify-center items-center h-[60vh] gap-4">
        <AlertCircle className="text-red-500 w-12 h-12" />
        <h2 className="text-xl font-bold text-slate-800">Failed to load students</h2>
        <p className="text-slate-500">Please check your API or try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Students Directory</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredStudents.length} of {students.length} students</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <RequirePermission permissions={[PERMISSIONS.students.create]}>
            <button onClick={handleOCRUpload} disabled={ocrUploading} className="bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-purple-700 transition disabled:opacity-50 font-bold shadow-sm text-sm">
              {ocrUploading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              {ocrUploading ? "Processing..." : "OCR"}
            </button>
            <button onClick={handleImportCSV} className="bg-emerald-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-700 transition font-bold shadow-sm text-sm">
              <Upload size={18} /> Import
            </button>
            <button onClick={() => router.push("/students/add")} className="bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-700 transition font-bold shadow-sm text-sm">
              <UserPlus size={18} /> Add New
            </button>
          </RequirePermission>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, admission no, roll no, father name, phone, CNIC..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 transition ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <Filter size={16} /> Filters
          </button>
          <button onClick={handleExportCSV} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition">
            <Download size={16} /> Export
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={classFilter} onChange={e => { setClassFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Classes</option>
              {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sectionFilter} onChange={e => { setSectionFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Sections</option>
              {uniqueSections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <button onClick={() => { setStatusFilter(""); setClassFilter(""); setSectionFilter(""); setGenderFilter(""); setSearchQuery(""); setCurrentPage(1); }} className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl font-medium transition">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between flex-wrap gap-3">
          <span className="text-blue-800 font-bold text-sm">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkArchive} disabled={bulkMutation.isPending} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl text-sm font-bold hover:bg-yellow-200 transition disabled:opacity-50 flex items-center gap-1">
              <Archive size={14} /> Archive
            </button>
            <button onClick={handleBulkDelete} disabled={bulkMutation.isPending} className="px-4 py-2 bg-red-100 text-red-800 rounded-xl text-sm font-bold hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-1">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider cursor-pointer hover:text-slate-700" onClick={() => handleSort("fullName")}>
                  <span className="flex items-center gap-1">Name <ArrowUpDown size={12} /></span>
                </th>
                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider cursor-pointer hover:text-slate-700" onClick={() => handleSort("classGrade")}>
                  <span className="flex items-center gap-1">Class <ArrowUpDown size={12} /></span>
                </th>
                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider cursor-pointer hover:text-slate-700" onClick={() => handleSort("rollNumber")}>
                  <span className="flex items-center gap-1">Roll No <ArrowUpDown size={12} /></span>
                </th>
                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider">Status</th>
                <th className="p-4 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.map((s: any) => {
                const status = s.status || (s.deleted ? "archived" : "active");
                const statusColor = STATUS_COLORS[status] || STATUS_COLORS.active;
                return (
                  <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.has(s.id) ? "bg-blue-50" : ""} ${deleteMutation.isPending && deleteMutation.variables === s.id ? "opacity-50 pointer-events-none" : ""}`}>
                    <td className="p-4">
                      <button onClick={() => toggleSelect(s.id)} className="text-slate-400 hover:text-slate-600">
                        {selectedIds.has(s.id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {s.photoBase64 ? (
                          <Image src={s.photoBase64} alt="" width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">
                            {(s.fullName || "?")[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{s.fullName || "N/A"}</p>
                          <p className="text-xs text-slate-400">{s.fatherName || ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">
                        {s.classGrade || "N/A"} - {s.section || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium text-sm">{s.rollNumber ?? "N/A"}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                        {STATUS_LABELS[status] || status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Link href={`/students/${s.id}`} className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition" title="View 360">
                          <Eye size={16} />
                        </Link>
                        <RequirePermission permissions={[PERMISSIONS.students.delete]}>
                          <button onClick={() => { if (confirm("Delete this student?")) deleteMutation.mutate(s.id); }} className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition disabled:opacity-50" disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending && deleteMutation.variables === s.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </RequirePermission>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedStudents.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400 font-medium">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages} ({filteredStudents.length} total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-slate-50 transition flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
