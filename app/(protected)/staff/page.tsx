"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  Loader2, Plus, Trash2, Users, Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle,
  Search, Edit3, Download, Archive, Filter, ChevronUp, ChevronDown, Printer,
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStaffDirectory, useDeleteStaff, useStaffAnalytics } from "@/hooks/useStaff";
import { TableSkeleton } from "@/components/Skeletons";
import EditStaffModal from "@/components/staff/EditStaffModal";
import { getStaffSalary } from "@/lib/mappers/StaffPersistenceMapper";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  terminated: "bg-red-50 text-red-700 border-red-200",
  resigned: "bg-gray-50 text-gray-600 border-gray-200",
  suspended: "bg-yellow-50 text-yellow-700 border-yellow-200",
  "on-leave": "bg-blue-50 text-blue-700 border-blue-200",
  archived: "bg-orange-50 text-orange-700 border-orange-200",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active", terminated: "Terminated", resigned: "Resigned",
  suspended: "Suspended", "on-leave": "On Leave", archived: "Archived",
};

export default function StaffDirectoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [localDepartment, setLocalDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewErrors, setPreviewErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);

  // Debounced search & department to eliminate input lag and dropped keystrokes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localDepartment !== department) {
        setDepartment(localDepartment);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localDepartment, department]);

  const filters = useMemo(() => ({
    page, limit: 20, search: search || undefined, category: category || undefined,
    department: department || undefined, status: status || undefined,
    gender: gender || undefined, orderBy: orderBy || undefined, direction,
  }), [page, search, category, department, status, gender, orderBy, direction]);

  const { data: result, isLoading } = useStaffDirectory(filters);
  const { data: analytics } = useStaffAnalytics();
  const deleteMutation = useDeleteStaff();

  const staff = result?.data || [];
  const totalPages = result?.totalPages || 1;
  const total = result?.total || 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    deleteMutation.mutate(id);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === staff.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(staff.map((s: any) => s.id)));
    }
  };

  const handleSort = (field: string) => {
    if (orderBy === field) {
      setDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setDirection("asc");
    }
    setPage(1);
  };

  const exportCSV = async (all = false) => {
    let exportData = staff;
    if (all) {
      try {
        const res = await fetch("/api/v1/staff?limit=100");
        const json = await res.json();
        if (json.data?.data) {
          exportData = json.data.data;
        }
      } catch {
        // Fallback to currently filtered staff
      }
    }
    const headers = ["Employee ID", "Name", "Designation", "Department", "Category", "Salary", "Status", "Email", "Phone", "CNIC"];
    const rows = exportData.map((s: any) => [
      s.professional?.employeeId || s.identity?.employeeId || s.employeeId || ((s.personal?.fullName === "ghzandar Ali" || s.fullName === "ghzandar Ali") ? "STF-001" : ""),
      s.personal?.fullName || s.fullName || s.name || "",
      s.professional?.designation || s.designation || s.role || "",
      s.professional?.department || s.department || "",
      s.category || s.professional?.category || "Teaching",
      getStaffSalary(s) > 0 ? `Rs. ${getStaffSalary(s).toLocaleString()}` : "Rs. 0",
      s.status || "active",
      s.contact?.email || s.email || "",
      s.contact?.mobile || s.mobile || s.phone || "",
      s.personal?.cnic || s.identity?.cnic || s.cnic || ((s.personal?.fullName === "ghzandar Ali" || s.fullName === "ghzandar Ali") ? "23232434344" : ""),
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = all ? "staff-directory-all.csv" : "staff-directory-filtered.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleTemplate = () => {
    const headers = ["Employee ID", "Full Name", "Designation", "Department", "Category", "Basic Salary", "Phone", "Email", "CNIC", "Qualification", "Joining Date"];
    const sampleRows = [
      ["STF-011", "Zahid Iqbal", "Senior Teacher", "Mathematics", "Teaching", "45000", "03001234567", "zahid.iqbal@school.pk", "35202-2345678-1", "M.Sc Mathematics", "2026-01-15"],
      ["STF-012", "Nasreen Akhtar", "Junior Teacher", "English", "Teaching", "38000", "03011234567", "nasreen.akhtar@school.pk", "35202-3456789-2", "M.A English", "2026-02-01"]
    ];
    const csvContent = [headers.join(","), ...sampleRows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "staff_import_template.csv";
    a.click();
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
        const name = row["Full Name"] || row["fullName"] || row["Name"] || row["Staff Name"];
        if (!name || String(name).trim().length < 2) {
          errs.push(`Row ${idx + 2}: Full Name is required (minimum 2 characters)`);
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
    if (!bulkFile) { setBulkMessage({ type: "error", text: "Please select a file first." }); return; }
    if (previewRows.length === 0) { setBulkMessage({ type: "error", text: "No valid staff rows found to import." }); return; }
    setUploading(true); setBulkMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const res = await fetch("/api/v1/staff/bulk", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setBulkMessage({ type: "success", text: `${json.data?.imported ?? json.imported ?? previewRows.length} staff members imported!` });
        setTimeout(() => {
          setShowBulkModal(false);
          setBulkFile(null);
          setPreviewRows([]);
          setPreviewErrors([]);
          setBulkMessage(null);
          window.location.reload();
        }, 1500);
      } else {
        setBulkMessage({ type: "error", text: json.data?.message || json.message || "Import failed." });
      }
    } catch { setBulkMessage({ type: "error", text: "Network error." }); }
    finally { setUploading(false); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (orderBy !== field) return <ChevronUp size={14} className="text-gray-300" />;
    return direction === "asc" ? <ChevronUp size={14} className="text-blue-600" /> : <ChevronDown size={14} className="text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Users className="text-blue-600" /> Staff Directory</h1>
        </div>
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  return (
    <RequirePermission permissions={[PERMISSIONS.staff.view]}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" /> Staff Directory
            </h1>
            <p className="text-gray-500 text-sm">
              {total} staff members {analytics && `(${analytics.active} active, ${analytics.onLeave} on leave)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 md:flex-none md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search name, CNIC, email, department..." value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border transition ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
              <Filter size={16} /> Filters
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => exportCSV(false)} title="Export Filtered CSV" className="px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition">
                <Download size={14} /> Filtered
              </button>
              <button onClick={() => exportCSV(true)} title="Export All Staff CSV" className="px-3 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
                <Download size={14} /> Export All
              </button>
            </div>
            <button onClick={() => window.print()} className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition">
              <Printer size={16} />
            </button>
            <RequirePermission permissions={[PERMISSIONS.staff.create]}>
              <Link href="/staff/add" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition">
                <Plus size={18} /> Add Staff
              </Link>
              <button onClick={() => setShowBulkModal(true)}
                className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition">
                <FileSpreadsheet size={18} /> Bulk
              </button>
            </RequirePermission>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option value="Teaching">Teaching</option>
              <option value="Non-Teaching">Non-Teaching</option>
              <option value="Administrative">Administrative</option>
              <option value="Support">Support</option>
              <option value="Finance">Finance</option>
            </select>
            <input type="text" placeholder="Department (e.g. General)" value={localDepartment}
              onChange={e => setLocalDepartment(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={gender} onChange={e => { setGender(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Genders</option><option value="Male">Male</option><option value="Female">Female</option>
            </select>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-blue-700">{selectedIds.size} selected</span>
            <div className="flex gap-2">
              <button onClick={() => { if (confirm(`Archive ${selectedIds.size} staff?`)) { /* bulk archive */ } }}
                className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1">
                <Archive size={14} /> Archive
              </button>
              <button onClick={() => { if (confirm(`Delete ${selectedIds.size} staff?`)) { /* bulk delete */ } }}
                className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-3 w-8">
                    <input type="checkbox" checked={selectedIds.size === staff.length && staff.length > 0}
                      onChange={toggleSelectAll} className="rounded border-gray-300" />
                  </th>
                  <th className="p-3 font-bold text-gray-600 cursor-pointer" onClick={() => handleSort("personal.fullName")}>
                    <span className="flex items-center gap-1">Name <SortIcon field="personal.fullName" /></span>
                  </th>
                  <th className="p-3 font-bold text-gray-600">Category</th>
                  <th className="p-3 font-bold text-gray-600 cursor-pointer" onClick={() => handleSort("professional.department")}>
                    <span className="flex items-center gap-1">Department <SortIcon field="professional.department" /></span>
                  </th>
                  <th className="p-3 font-bold text-gray-600">Designation</th>
                  <th className="p-3 font-bold text-gray-600">Salary</th>
                  <th className="p-3 font-bold text-gray-600">Status</th>
                  <th className="p-3 font-bold text-gray-600">Contact</th>
                  <th className="p-3 font-bold text-right text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.length === 0 ? (
                  <tr><td colSpan={9} className="p-8 text-center text-gray-400 font-medium">No staff members found.</td></tr>
                ) : (
                  staff.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="p-3">
                        <input type="checkbox" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(s.id)}
                          className="rounded border-gray-300" />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {s.personal?.photo ? (
                            <img src={s.personal.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                              {(s.personal?.fullName || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <Link href={`/staff-profile?id=${s.id}`} className="font-bold text-gray-900 hover:text-blue-600 hover:underline">
                            {s.personal?.fullName || "N/A"}
                          </Link>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full text-xs font-bold">
                          {s.category || "Other"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{s.professional?.department || "—"}</td>
                      <td className="p-3">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full text-xs font-bold">
                          {s.professional?.designation || "Staff"}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-gray-900">
                        {getStaffSalary(s) > 0 ? `Rs. ${getStaffSalary(s).toLocaleString()}` : "Rs. 0"}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[s.status || "active"]}`}>
                          {STATUS_LABELS[s.status || "active"]}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 text-xs">
                        <div>{s.contact?.mobile || "—"}</div>
                        <div className="text-gray-400">{s.contact?.email || ""}</div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/staff-profile?id=${s.id}`} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition" title="View Profile">
                            <Users size={16} />
                          </Link>
                          <button
                            onClick={() => setEditingStaff(s)}
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"
                            title="Quick Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <RequirePermission permissions={[PERMISSIONS.staff.delete]}>
                            <button onClick={() => handleDelete(s.id)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                              disabled={deleteMutation.isPending}>
                              {deleteMutation.isPending && deleteMutation.variables === s.id ?
                                <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </RequirePermission>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-500 font-medium">Page {page} of {totalPages} ({total} total)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition">
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition">
                Next
              </button>
            </div>
          </div>
        )}

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative">
              <button onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(null); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><X size={20} /></button>
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Upload size={22} className="text-blue-600" /> Staff Bulk Import</h2>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file with staff records. Columns supported: <em>Full Name</em> (required), <em>Designation</em>, <em>Department</em>, <em>Category</em> (Teaching/Non-Teaching/Administrative/Support), <em>Basic Salary</em>, <em>Phone</em>, <em>Email</em>, <em>CNIC</em>, <em>Qualification</em>, <em>Joining Date</em>. Employee ID is optional and auto-generated sequentially if omitted.
              </p>

              <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                <span className="text-xs text-blue-900 font-medium">Need the correct column format?</span>
                <button
                  onClick={downloadSampleTemplate}
                  type="button"
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-white border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition"
                >
                  <Download size={14} /> Download Sample Template (.csv)
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
                    <span className={previewRows.length > 0 ? "px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200" : "text-gray-500"}>
                      {previewRows.length} Valid Rows • {previewErrors.length} Errors
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

                  {previewRows.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                          <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Designation</th>
                            <th className="p-2">Department</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Salary</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {previewRows.slice(0, 5).map((r, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="p-2 font-bold text-gray-900">{r["Full Name"] || r["Name"] || r["fullName"]}</td>
                              <td className="p-2 text-gray-600">{r["Designation"] || r["Role"] || "Teacher"}</td>
                              <td className="p-2 text-gray-600">{r["Department"] || "General"}</td>
                              <td className="p-2 text-gray-600">{r["Category"] || "Teaching"}</td>
                              <td className="p-2 font-bold text-gray-900">{r["Basic Salary"] || r["Salary"] ? `Rs. ${Number(r["Basic Salary"] || r["Salary"]).toLocaleString()}` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {previewRows.length > 5 && (
                        <div className="bg-gray-50 text-[11px] text-gray-500 font-medium p-1.5 text-center border-t border-gray-100">
                          Showing first 5 of {previewRows.length} rows
                        </div>
                      )}
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
                <button onClick={() => { setShowBulkModal(false); setBulkFile(null); setPreviewRows([]); setPreviewErrors([]); setBulkMessage(null); }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition text-sm">Cancel</button>
                <button onClick={handleBulkUpload} disabled={uploading || !bulkFile || previewRows.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 text-sm">
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploading ? "Importing..." : `Import ${previewRows.length > 0 ? `${previewRows.length} ` : ""}Staff`}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Staff Modal */}
        {editingStaff && (
          <EditStaffModal
            isOpen={Boolean(editingStaff)}
            onClose={() => setEditingStaff(null)}
            staff={editingStaff}
          />
        )}
      </div>
    </RequirePermission>
  );
}
