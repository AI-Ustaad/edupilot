"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Upload, Loader2, FileText, Image as ImageIcon, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

// 🚀 Hooks
import { useCreateStaff } from "@/hooks/useStaff";
import { useToast } from "@/components/ToastProvider";

export default function StaffOCRPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState("");

  const createMutation = useCreateStaff();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setExtractedData(null); setError(""); }
  };

  const handleExtract = async () => {
    if (!file) return setError("Please select a file.");
    setExtracting(true); setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/v1/ocr", { method: "POST", body: formData });
      const json = await res.json();
      if (res.ok && json.success) {
        setExtractedData(json.data);
        showToast("Data extracted successfully!", "success");
      } else {
        setError(json.message || "Extraction failed.");
      }
    } catch (err) { setError("Network error."); } 
    finally { setExtracting(false); }
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedData) return;

    const payload = {
      personal: { fullName: extractedData.fullName || "", cnic: extractedData.cnic || "", phone: extractedData.phone || "" },
      professional: { designation: extractedData.designation || "", joiningDate: extractedData.joiningDate || "" },
      payroll: { basicSalary: extractedData.basicSalary || 0, bankName: extractedData.bankName || "", accountNumber: extractedData.accountNumber || "" },
      tenantId: user?.tenantId, createdBy: user?.uid, admissionMethod: "ocr",
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setTimeout(() => router.push("/staff"), 1500);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><FileText className="text-indigo-600" /> OCR Staff Import</h1>
      <p className="text-gray-500 text-sm">Upload a salary slip or CNIC image to automatically extract staff details.</p>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold flex items-center gap-2"><AlertCircle size={20} /> {error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex flex-col items-center justify-center w-full sm:w-64 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
            {file ? (
              <div className="text-center p-2"><ImageIcon size={32} className="mx-auto text-gray-500" /><p className="text-sm font-medium text-gray-700 mt-1 truncate max-w-[150px]">{file.name}</p></div>
            ) : (
              <div className="text-center p-2"><Upload size={32} className="mx-auto text-gray-400" /><p className="text-sm font-medium text-gray-500 mt-1">Click to upload</p><p className="text-xs text-gray-400">PNG, JPG, PDF</p></div>
            )}
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          </label>
          <button onClick={handleExtract} disabled={!file || extracting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
            {extracting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />} {extracting ? "Extracting..." : "Extract Data"}
          </button>
        </div>
      </div>

      {extractedData && (
        <form onSubmit={handleCreateStaff} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-green-600 flex items-center gap-2"><CheckCircle2 size={20} /> Extracted Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold">Name:</span> {extractedData.fullName}</div>
            <div><span className="font-bold">CNIC:</span> {extractedData.cnic}</div>
            <div><span className="font-bold">Designation:</span> {extractedData.designation}</div>
            <div><span className="font-bold">Basic Salary:</span> {extractedData.basicSalary}</div>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
            {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />} {createMutation.isPending ? "Creating..." : "Create Staff Member"}
          </button>
        </form>
      )}
    </div>
  );
}
