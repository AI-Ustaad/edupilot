"use client";
import { useState } from "react";
import { Upload, Loader2, FileText, AlertCircle } from "lucide-react";

interface OCRUploaderProps {
  onExtracted: (data: any) => void;
  onError?: (error: string) => void;
}

export function OCRUploader({ onExtracted, onError }: OCRUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
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
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/v1/staff/ocr", { method: "POST", body: formData });
      const json = await res.json();

      if (res.ok && json.success) {
        onExtracted(json.data);
      } else {
        const msg = json.error || "Extraction failed.";
        setError(msg);
        onError?.(msg);
      }
    } catch {
      const msg = "Network error.";
      setError(msg);
      onError?.(msg);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label className="flex flex-col items-center justify-center w-full sm:w-64 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition">
          {file ? (
            <div className="text-center p-2">
              <FileText size={32} className="mx-auto text-gray-500" />
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
      {error && (
        <div className="mt-3 bg-red-50 text-red-700 p-3 rounded-xl font-bold flex items-center gap-2 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}
    </div>
  );
}
