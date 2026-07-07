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
    setExtracting(true); 
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // 🚀 Calling the new Staff OCR API (Hybrid Google Vision + PDF Parse)
      const res = await fetch("/api/v1/staff/ocr", { method: "POST", body: formData });
      const json = await res.json();
      
      if (res.ok && json.success) {
        setExtractedData(json.data);
        showToast("Data extracted successfully!", "success");
      } else {
        setError(json.error || "Extraction failed.");
      }
    } catch (err) { 
      setError("Network error."); 
    } 
    finally { setExtracting(false); }
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedData) return;

    // 🚀 Comprehensive Payload Mapping
    const payload = {
      personal: { 
        fullName: extractedData.fullName || "", 
        fatherName: extractedData.fatherName || "",
        cnic: extractedData.cnic || "", 
        dob: extractedData.dob || "",
        photo: extractedData.photoBase64 || "" // If image was uploaded, it acts as photo too
      },
      contact: {
        mobile: extractedData.phone || ""
      },
      professional: { 
        designation: extractedData.designation || "", 
        personnelNo: extractedData.personnelNo || "",
        joiningDate: extractedData.joiningDate || "" 
      },
      payroll: { 
        basicSalary: extractedData.basicSalary ? parseFloat(extractedData.basicSalary) : 0, 
        grossSalary: extractedData.grossPay ? parseFloat(extractedData.grossPay) : 0,
        bankName: extractedData.bankName || "", 
        accountNumber: extractedData.accountNumber || "" 
      },
      tenantId: user?.tenantId, 
      createdBy: user?.uid, 
      admissionMethod: "ocr",
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        showToast("Staff member created successfully!", "success");
        setTimeout(() => router.push("/staff"), 1500);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <FileText className="text-indigo-600" /> OCR Staff Import
      </h1>
      <p className="text-gray-500 text-sm">Upload a salary slip (PDF/Image) or CNIC to automatically extract staff details.</p>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold flex items-center gap-2"><AlertCircle size={20} /> {error}</div>}

      {/* Upload Area */}
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
                <p className="text-xs text-gray-400">PNG, JPG, WEBP, PDF</p>
              </div>
            )}
            <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
          </label>
          <button 
            onClick={handleExtract} 
            disabled={!file || extracting} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {extracting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />} 
            {extracting ? "Extracting Data..." : "Extract Data"}
          </button>
        </div>
      </div>

      {/* Extracted Data Preview & Submit */}
      {extractedData && (
        <form onSubmit={handleCreateStaff} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-green-600 flex items-center gap-2 border-b pb-2">
            <CheckCircle2 size={20} /> Extracted Data (Please Verify)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Full Name</span> {extractedData.fullName || "N/A"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Father Name</span> {extractedData.fatherName || "N/A"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">CNIC</span> {extractedData.cnic || "N/A"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Date of Birth</span> {extractedData.dob || "N/A"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Designation</span> {extractedData.designation || "N/A"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Personnel No</span> {extractedData.personnelNo || "N/A"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Basic Salary</span> Rs. {extractedData.basicSalary || "0"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Gross Pay</span> Rs. {extractedData.grossPay || "0"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Bank Name</span> {extractedData.bankName || "N/A"}</div>
            <div className="bg-gray-50 p-3 rounded-lg"><span className="font-bold text-gray-700 block mb-1">Account Number</span> {extractedData.accountNumber || "N/A"}</div>
          </div>

          <button 
            type="submit" 
            disabled={createMutation.isPending} 
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md mt-2"
          >
            {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />} 
            {createMutation.isPending ? "Creating Staff..." : "Confirm & Create Staff Member"}
          </button>
        </form>
      )}
    </div>
  );
}
