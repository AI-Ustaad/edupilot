"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Loader2, Plus, Trash2, Users, Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle,
  Search, Edit3, Download, Archive, Filter, ChevronUp, ChevronDown, Printer,
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useStaffDirectory, useDeleteStaff, useStaffAnalytics } from "@/hooks/useStaff";
import { TableSkeleton } from "@/components/Skeletons";

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
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const exportCSV = () => {
    const headers = ["Name", "Designation", "Department", "Category", "Status", "Email", "Phone", "CNIC"];
    const rows = staff.map((s: any) => [
      s.personal?.fullName || "", s.professional?.designation || "", s.professional?.department || "",
      s.category || "", s.status || "active", s.contact?.email || "", s.contact?.mobile || "", s.personal?.cnic || "",
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "staff-directory.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) { setBulkMessage({ type: "error", text: "Please select a file first." }); return; }
    setUploading(true); setBulkMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);
      const res = await fetch("/api/v1/staff/bulk", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) {
        setBulkMessage({ type: "success", text: `${json.data?.imported ?? 0} staff members imported!` });
        setTimeout(() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(null); }, 2000);
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
              <input type="text" placeholder="Search name, CNIC, email, department..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border transition ${showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
              <Filter size={16} /> Filters
            </button>
            <button onClick={exportCSV} className="px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition">
              <Download size={16} /> CSV
            </button>
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
              <option value="Principal">Principal</option><option value="Vice Principal">Vice Principal</option>
              <option value="Teacher">Teacher</option><option value="Lab Staff">Lab Staff</option>
              <option value="Admin">Admin</option><option value="Accountant">Accountant</option>
              <option value="Librarian">Librarian</option><option value="Peon">Peon</option>
            </select>
            <input type="text" placeholder="Department" value={department}
              onChange={e => { setDepartment(e.target.value); setPage(1); }}
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
                  <th className="p-3 font-bold text-gray-600">Status</th>
                  <th className="p-3 font-bold text-gray-600">Contact</th>
                  <th className="p-3 font-bold text-right text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center text-gray-400 font-medium">No staff members found.</td></tr>
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
                          <Link href={`/staff/${s.id}/edit`} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition" title="Edit">
                            <Edit3 size={16} />
                          </Link>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 relative">
              <button onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(null); }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"><X size={20} /></button>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Upload size={20} /> Bulk Import</h2>
              <p className="text-sm text-gray-500 mb-4">Upload an Excel file (.xlsx) with staff records.</p>
              <input type="file" accept=".xlsx,.xls" onChange={e => { setBulkFile(e.target.files?.[0] || null); setBulkMessage(null); }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4" />
              {bulkMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold mb-3 ${bulkMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {bulkMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {bulkMessage.text}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(null); }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleBulkUpload} disabled={uploading || !bulkFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50">
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploading ? "Uploading..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
