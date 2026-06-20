"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function StaffOCRPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setExtractedData(null);
      setError("");
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setExtracting(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/v1/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            documentType: "salary_slip", // یا "cnic" وغیرہ
            tenantId: user?.tenantId,
          }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setExtractedData(json.data);
        } else {
          setError(json.message || "Extraction failed.");
        }
        setExtracting(false);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Network error.");
      setExtracting(false);
    }
  };

  const handleCreateStaff = async () => {
    if (!extractedData) return;
    setSubmitting(true);
    try {
      const payload = {
        personal: {
          fullName: extractedData.fullName || "",
          fatherName: extractedData.fatherName || "",
          cnic: extractedData.cnic || "",
          phone: extractedData.phone || "",
        },
        professional: {
          designation: extractedData.designation || "",
          department: extractedData.department || "",
          joiningDate: extractedData.joiningDate || "",
        },
        payroll: {
          basicSalary: extractedData.basicSalary || 0,
          allowances: extractedData.allowances || [],
          deductions: extractedData.deductions || [],
          bankName: extractedData.bankName || "",
          accountNumber: extractedData.accountNumber || "",
        },
        tenantId: user?.tenantId,
        createdBy: user?.uid,
        admissionMethod: "ocr",
      };

      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Staff created successfully via OCR!");
        setTimeout(() => router.push("/staff"), 1500);
      } else {
        const data = await res.json();
        setError(data.message || "Creation failed.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <FileText className="text-indigo-600" /> OCR Staff Import
      </h1>
      <p className="text-gray-500 text-sm">
        Upload a salary slip or CNIC image to automatically extract staff details.
      </p>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold flex items-center gap-2"><AlertCircle size={20} /> {error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold flex items-center gap-2"><CheckCircle2 size={20} /> {success}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex flex-col items-center justify-center w-full sm:w-64 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
            {file ? (
              <div className="text-center p-2">
                <ImageIcon size={32} className="mx-auto text-gray-500" />
                <p className="text-sm font-medium text-gray-700 mt-1 truncate max-w-[150px]">{file.name}</p>
              </div>
            ) : (
              <div className="text-center p-2">
                <Upload size={32} className="mx-auto text-gray-400" />
                <p className="text-sm font-medium text-gray-500 mt-1">Click to upload</p>
                <p className="text-xs text-gray-400">PNG, JPG, PDF</p>
              </div>
            )}
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          </label>
          <button
            onClick={handleExtract}
            disabled={!file || extracting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {extracting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {extracting ? "Extracting..." : "Extract Data"}
          </button>
        </div>
      </div>

      {extractedData && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-green-600 flex items-center gap-2"><CheckCircle2 size={20} /> Extracted Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold">Name:</span> {extractedData.fullName}</div>
            <div><span className="font-bold">Father Name:</span> {extractedData.fatherName}</div>
            <div><span className="font-bold">CNIC:</span> {extractedData.cnic}</div>
            <div><span className="font-bold">Phone:</span> {extractedData.phone}</div>
            <div><span className="font-bold">Designation:</span> {extractedData.designation}</div>
            <div><span className="font-bold">Basic Salary:</span> {extractedData.basicSalary}</div>
            <div><span className="font-bold">Allowances:</span> {JSON.stringify(extractedData.allowances)}</div>
            <div><span className="font-bold">Deductions:</span> {JSON.stringify(extractedData.deductions)}</div>
          </div>
          <button
            onClick={handleCreateStaff}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            {submitting ? "Creating..." : "Create Staff Member"}
          </button>
        </div>
      )}
    </div>
  );
}
