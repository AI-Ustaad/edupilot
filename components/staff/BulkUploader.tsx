"use client";
import { useState } from "react";
import { X, Upload, Loader2, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";

interface BulkUploaderProps {
  onComplete?: (result: { imported: number; failed: number }) => void;
}

export function BulkUploader({ onComplete }: BulkUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpload = async () => {
    if (!bulkFile) {
      setMessage({ type: "error", text: "Please select a file first." });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      const res = await fetch("/api/v1/staff/bulk", { method: "POST", body: formData });
      const json = await res.json();

      if (json.success) {
        setMessage({ type: "success", text: `✅ ${json.imported ?? json.count ?? 0} staff members imported!` });
        onComplete?.({ imported: json.imported ?? json.count ?? 0, failed: json.failed ?? 0 });
        setTimeout(() => {
          setIsOpen(false);
          setBulkFile(null);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: "error", text: json.message || "Import failed." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition"
      >
        <FileSpreadsheet size={18} /> Bulk Import
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => { setIsOpen(false); setBulkFile(null); setMessage(null); }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Upload size={20} /> Bulk Import Staff
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Upload an Excel file (.xlsx) containing staff records. The file must have columns:{" "}
              <strong>Full Name, Email, Phone, Designation, Personnel No</strong>.
            </p>
            <div className="mb-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  setBulkFile(e.target.files?.[0] || null);
                  setMessage(null);
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold mb-3 ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
              }`}>
                {message.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                {message.text}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsOpen(false); setBulkFile(null); setMessage(null); }}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
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
    </>
  );
}
