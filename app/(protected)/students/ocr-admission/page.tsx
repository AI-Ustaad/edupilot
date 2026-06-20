"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  Camera,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function OCRAdmissionPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // یہ وہ اضافی فیلڈز ہیں جو OCR نہیں نکال سکتا، انہیں صارف خود بھرے گا
  const [manualFields, setManualFields] = useState({
    classGrade: "",
    section: "",
    rollNumber: "",
    guardianRelation: "",
    previousSchool: "",
    medicalConditions: "",
  });

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
      // فائل کو Base64 میں تبدیل کریں (یا FormData استعمال کریں)
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1]; // data:image/png;base64, کے بغیر
        const res = await fetch("/api/students/ocr-admission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            fileName: file.name,
            tenantId: user?.tenantId,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setExtractedData(json.data);
        } else {
          setError(json.message || "OCR extraction failed.");
        }
        setExtracting(false);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setExtracting(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Network error. Please try again.");
      setExtracting(false);
    }
  };

  // داخلہ فائنل کریں
  const handleAdmit = async () => {
    if (!extractedData) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...extractedData,
        ...manualFields,
        tenantId: user?.tenantId,
        createdBy: user?.uid,
        admissionMethod: "ocr",
      };

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess("Student admitted successfully via OCR!");
        setTimeout(() => router.push("/students"), 1500);
      } else {
        const data = await res.json();
        setError(data.message || "Admission failed.");
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
        <FileText className="text-indigo-600" /> OCR Admission
      </h1>
      <p className="text-sm text-gray-500">
        Upload a scanned admission form image or PDF. The system will automatically extract student details.
      </p>

      {/* Error / Success */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold flex items-center gap-2">
          <CheckCircle2 size={20} /> {success}
        </div>
      )}

      {/* File Upload */}
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {extracting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            {extracting ? "Extracting..." : "Extract Data"}
          </button>
        </div>
      </div>

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
          <h2 className="font-bold text-lg flex items-center gap-2 text-green-600">
            <CheckCircle2 size={20} /> Extracted Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auto-extracted fields (readonly) */}
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
          <div>
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
            onClick={handleAdmit}
            disabled={submitting || !manualFields.classGrade}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
            {submitting ? "Admitting..." : "Confirm Admission via OCR"}
          </button>
        </div>
      )}
    </div>
  );
}

// Reusable components
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
      <input
        readOnly
        value={value}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2 text-gray-700 cursor-not-allowed"
      />
    </div>
  );
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
      <input {...props} className="w-full border border-gray-300 rounded-xl p-2 text-gray-900" />
    </div>
  );
}
