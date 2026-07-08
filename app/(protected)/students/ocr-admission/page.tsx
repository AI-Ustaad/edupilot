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

// 🚀 Layered Architecture Hooks
import { useCreateStudent } from "@/hooks/useStudents";
import { useToast } from "@/components/ToastProvider";
import { mapOCRToStudentForm } from "@/lib/mappers/student.mapper";

export default function OCRAdmissionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // یہ وہ اضافی فیلڈز ہیں جو OCR نہیں نکال سکتا، انہیں صارف خود بھرے گا
  const [manualFields, setManualFields] = useState({
    classGrade: "",
    section: "",
    rollNumber: "",
    guardianRelation: "",
    previousSchool: "",
    medicalConditions: "",
  });

  const createMutation = useCreateStudent();

  // فائل اپ لوڈ ہینڈلر
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExtractedData(null);
      setError("");
    }
  };

  // OCR API کو کال کریں
  const handleExtract = async () => {
    if (!file) {
      setError("Please select an image or PDF file.");
      return;
    }

    setExtracting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await fetch("/api/v1/students/ocr-admission", { 
        method: "POST", 
        body: formData 
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        const { studentFormData } = mapOCRToStudentForm(json.data);
        setExtractedData(studentFormData);
        showToast("Data extracted successfully!", "success");
      } else {
        setError(json.message || "OCR extraction failed.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  // داخلہ فائنل کریں (Enterprise Hook کے ذریعے)
  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedData) return;

    setSubmitting(true);
    setError("");

    const payload = {
      ...extractedData,
      ...manualFields,
      tenantId: user?.tenantId,
      createdBy: user?.uid,
      admissionMethod: "ocr",
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        showToast("Student admitted successfully via OCR!", "success");
        setTimeout(() => router.push("/students"), 1500);
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || "Admission failed.");
        setSubmitting(false);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <FileText className="text-indigo-600" /> OCR Admission
      </h1>
      <p className="text-sm text-gray-500">
        Upload a scanned admission form image or PDF. The system will automatically extract student details.
      </p>

      {/* Error / Success Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* File Upload Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Upload size={20} className="text-indigo-500" /> Upload Document
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex flex-col items-center justify-center w-full sm:w-64 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
            {file ? (
              <div className="text-center p-2">
                <ImageIcon size={32} className="mx-auto text-gray-500" />
                <p className="text-sm font-medium text-gray-700 mt-1 truncate max-w-[150px]">{file.name}</p>
                <p className="text-xs text-gray-400">Click to change</p>
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition w-full sm:w-auto"
          >
            {extracting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {extracting ? "Extracting..." : "Extract Data"}
          </button>
        </div>
      </div>

      {/* Extracted Data Preview & Manual Form */}
      {extractedData && (
        <form onSubmit={handleAdmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <h2 className="font-bold text-lg flex items-center gap-2 text-green-600">
            <CheckCircle2 size={20} /> Extracted Information
          </h2>

          {/* Auto-extracted fields (readonly) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" value={extractedData.fullName || ""} />
            <Field label="Father Name" value={extractedData.fatherName || ""} />
            <Field label="CNIC / B-Form" value={extractedData.cnic || ""} />
            <Field label="Date of Birth" value={extractedData.dob || ""} />
            <Field label="Gender" value={extractedData.gender || ""} />
            <Field label="Phone" value={extractedData.phone || ""} />
            <Field label="Address" value={extractedData.address || ""} />
            <Field label="Guardian Name" value={extractedData.guardianName || ""} />
            <Field label="Guardian Phone" value={extractedData.guardianPhone || ""} />
          </div>

          {/* Manual fields (editable) */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3">Additional Details (Fill Manually)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Class / Grade *"
                value={manualFields.classGrade}
                onChange={(e) => setManualFields({ ...manualFields, classGrade: e.target.value })}
                required
              />
              <Input
                label="Section"
                value={manualFields.section}
                onChange={(e) => setManualFields({ ...manualFields, section: e.target.value })}
              />
              <Input
                label="Roll Number"
                value={manualFields.rollNumber}
                onChange={(e) => setManualFields({ ...manualFields, rollNumber: e.target.value })}
              />
              <Input
                label="Guardian Relation"
                value={manualFields.guardianRelation}
                onChange={(e) => setManualFields({ ...manualFields, guardianRelation: e.target.value })}
              />
              <Input
                label="Previous School"
                value={manualFields.previousSchool}
                onChange={(e) => setManualFields({ ...manualFields, previousSchool: e.target.value })}
              />
              <Input
                label="Medical Conditions"
                value={manualFields.medicalConditions}
                onChange={(e) => setManualFields({ ...manualFields, medicalConditions: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !manualFields.classGrade}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            {submitting ? "Admitting..." : "Confirm Admission via OCR"}
          </button>
        </form>
      )}
    </div>
  );
}

// 🛠️ Reusable UI Components
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
      <input
        readOnly
        value={value}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-700 cursor-not-allowed"
      />
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
      <input {...props} className="w-full border border-gray-300 rounded-xl p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
  );
}
