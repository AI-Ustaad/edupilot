"use client";
import Image from "next/image";
import { Upload, Trash2, FileText } from "lucide-react";

// ─── Shared Form Primitives for Staff Module ────────────────────────────────
// Single source of truth for Input, Select, Section, DocumentUpload components.
// Used by: staff/add, staff/[id]/edit, StaffForm

export const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><input {...props} className="w-full p-2 border rounded-xl" /></div>
);

export const Select = ({ label, options, ...props }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label><select {...props} className="w-full p-2 border rounded-xl bg-white">{options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}</select></div>
);

export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-gray-200"><h3 className="col-span-2 font-bold text-lg text-gray-800">{title}</h3>{children}</div>
);

// Alias for backward compatibility
export { Section as FormSection };

export const DocumentUpload = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isImage = value.startsWith("data:image");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center h-32 hover:border-blue-500 transition">
        <input type="file" accept="image/*,application/pdf,.docx" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
        {value ? (
          isImage ? (
            <Image src={value} alt={label} width={80} height={80} className="object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center text-gray-600">
              <FileText size={24} />
              <span className="text-xs mt-1">File Selected</span>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <Upload size={24} />
            <span className="text-xs mt-1">Click to Upload</span>
          </div>
        )}
      </div>
      {value && (
        <button type="button" onClick={() => onChange("")} className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <Trash2 size={12} /> Remove
        </button>
      )}
    </div>
  );
};
