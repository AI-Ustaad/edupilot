"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Loader2, Plus, Trash2, Users, Upload, FileSpreadsheet, X, CheckCircle2, AlertTriangle, Search, Edit3,
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

// 🚀 Layered Architecture Hooks & Skeletons
import { useStaffList, useDeleteStaff, useSearchStaff } from "@/hooks/useStaff";
import { TableSkeleton } from "@/components/Skeletons";

export default function StaffDirectoryPage() {
  // 1. Fetch Staff using paginated hook
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data: paginatedData, isLoading } = useStaffList(page, limit);
  const staff = paginatedData?.data || [];
  const totalPages = paginatedData?.totalPages || 1;
  
  // 2. Delete Mutation (With Optimistic Update Built-in)
  const deleteMutation = useDeleteStaff();

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults } = useSearchStaff(searchQuery);
  const displayStaff = searchQuery.length >= 2 ? (searchResults || []) : staff;

  // Bulk Import states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return;
    deleteMutation.mutate(id);
  };

  // Bulk Import handler
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

      const res = await fetch("/api/v1/staff/bulk", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) {
        setBulkMessage({ type: "success", text: `${json.data?.imported ?? 0} staff members imported successfully!` });
        setTimeout(() => {
          setShowBulkModal(false);
          setBulkFile(null);
          setBulkMessage(null);
        }, 2000);
      } else {
        setBulkMessage({ type: "error", text: json.data?.message || json.message || "Import failed." });
      }
    } catch (err) {
      setBulkMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600"/> Staff Directory
          </h1>
        </div>
        <TableSkeleton rows={6} cols={4} />
      </div>
    );
  }

  return (
    <RequirePermission permissions={[PERMISSIONS.staff.view]}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600"/> Staff Directory
            </h1>
            <p className="text-gray-500 text-sm">Manage teachers and administrative staff.</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:flex-none md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, CNIC, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <RequirePermission permissions={[PERMISSIONS.staff.create]}>
              <Link
                href="/staff/add"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"
              >
                <Plus size={18} /> Add Staff
              </Link>
              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"
              >
                <FileSpreadsheet size={18} /> Bulk Import
              </button>
            </RequirePermission>
          </div>
        </div>

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 relative">
              <button
                onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(null); }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              >
                <X size={20} />
              </button>
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload size={20} /> Bulk Import Staff
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload an Excel file (.xlsx) containing staff records. The file must have columns: <strong>Full Name, Email, Phone, Designation, Personnel No</strong>.
              </p>
              <div className="mb-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    setBulkFile(e.target.files?.[0] || null);
                    setBulkMessage(null);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {bulkMessage && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold mb-3 ${
                  bulkMessage.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}>
                  {bulkMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {bulkMessage.text}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkMessage(null); }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpload}
                  disabled={uploading || !bulkFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploading ? "Uploading..." : "Upload & Import"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Table or Skeleton */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-bold text-gray-600">Name</th>
                  <th className="p-4 font-bold text-gray-600">Role</th>
                  <th className="p-4 font-bold text-gray-600">Email</th>
                  <th className="p-4 font-bold text-right text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayStaff.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">{searchQuery ? "No matching staff found." : "No staff members found."}</td></tr>
                ) : (
                  displayStaff.map((s: any) => (
                    <tr 
                      key={s.id} 
                      className={`hover:bg-gray-50 transition ${
                        deleteMutation.isPending && deleteMutation.variables === s.id ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <td className="p-4 font-bold text-gray-900">
                        <Link href={`/staff-profile?id=${s.id}`} className="hover:text-blue-600 hover:underline">
                          {s.personal?.fullName || s.fullName || "N/A"}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {s.professional?.designation || s.role || "Staff"}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{s.contact?.email || s.email || "N/A"}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/staff/${s.id}/edit`}
                            className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition"
                          >
                            <Edit3 size={16} />
                          </Link>
                          <RequirePermission permissions={[PERMISSIONS.staff.delete]}>
                            <button 
                            onClick={() => handleDelete(s.id)} 
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending && deleteMutation.variables === s.id ? 
                              <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18}/>
                            }
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

        {/* Pagination Controls */}
        {!searchQuery && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
