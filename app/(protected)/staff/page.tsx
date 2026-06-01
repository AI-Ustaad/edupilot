"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Search, Plus, Pencil, Trash2, Loader2, Upload, FileSpreadsheet, FileText, Image, File
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx"; // npm install xlsx

interface StaffMember {
  id: string;
  personal: {
    fullName: string;
    email?: string;
    phone?: string;
  };
  professional: {
    designation: string;
    personnelNo: string;
  };
}

export default function StaffPage() {
  const t = useTranslations("Staff");
  const { user } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const router = useRouter();

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/staff");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      const staffData = Array.isArray(json?.data?.data)
        ? json.data.data
        : Array.isArray(json?.data)
        ? json.data
        : [];
      setStaffList(staffData);
    } catch (err) {
      console.error("Staff fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ---------- Bulk Import Logic ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBulkFile(file);
  };

  const processBulkImport = async () => {
    if (!bulkFile) {
      setBulkMessage("Please select an Excel file.");
      return;
    }
    setBulkProcessing(true);
    setBulkMessage("");
    try {
      const data = await bulkFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (!Array.isArray(rows) || rows.length === 0) {
        setBulkMessage("No data found in file.");
        return;
      }

      // Map Excel columns to expected staff fields (adjust column names as per your Excel)
      const staffMembers = rows.map((row) => ({
        personal: {
          fullName: row["Full Name"] || row.fullName || "",
          email: row["Email"] || row.email || "",
          phone: row["Phone"] || row.phone || "",
        },
        professional: {
          designation: row["Designation"] || row.designation || "",
          personnelNo: row["Personnel No"] || row.personnelNo || "",
        },
        // other fields can be added similarly
      }));

      const res = await fetch("/api/staff/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffMembers }),
      });
      const json = await res.json();
      if (res.ok) {
        setBulkMessage(`Successfully imported ${json.createdIds?.length || 0} records.`);
        fetchStaff(); // refresh list
      } else {
        setBulkMessage(json.message || "Import failed.");
      }
    } catch (err) {
      console.error(err);
      setBulkMessage("Error processing file.");
    } finally {
      setBulkProcessing(false);
    }
  };

  const filtered = (Array.isArray(staffList) ? staffList : []).filter((s) =>
    s.personal?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-black text-gray-900">Staff Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/staff/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} /> Add Staff
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <FileSpreadsheet size={18} /> Bulk Import
          </button>
          <button
            onClick={() => setShowDocUpload(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Upload size={18} /> Upload Documents
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl"
        />
      </div>

      {/* Staff Cards Grid */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No staff members found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((staff) => (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{staff.personal?.fullName}</h3>
                  <p className="text-sm text-gray-500">{staff.professional?.designation}</p>
                  <p className="text-xs text-gray-400 mt-1">{staff.personal?.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/staff/${staff.id}/edit`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this staff member?")) return;
                      await fetch(`/api/staff/${staff.id}`, { method: "DELETE" });
                      fetchStaff();
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Bulk Import Staff</h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload an Excel file (.xlsx, .xls) with columns: Full Name, Email, Phone, Designation, Personnel No.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="mb-4"
            />
            {bulkMessage && (
              <p className="text-sm text-gray-700 mb-2">{bulkMessage}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowBulkModal(false); setBulkMessage(""); setBulkFile(null); }}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={processBulkImport}
                disabled={bulkProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {bulkProcessing ? <Loader2 className="animate-spin" size={18} /> : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal (placeholder) */}
      {showDocUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
            <p className="text-sm text-gray-500 mb-4">
              This feature will allow uploading PDF, DOC, and images for staff records. Currently under development.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDocUpload(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
