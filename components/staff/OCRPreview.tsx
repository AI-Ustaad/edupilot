"use client";
import { CheckCircle2 } from "lucide-react";

interface OCRPreviewProps {
  data: Record<string, any>;
  title?: string;
}

const FIELDS = [
  { key: "fullName", label: "Full Name" },
  { key: "fatherName", label: "Father Name" },
  { key: "cnic", label: "CNIC" },
  { key: "dob", label: "Date of Birth" },
  { key: "designation", label: "Designation" },
  { key: "personnelNo", label: "Personnel No" },
  { key: "basicSalary", label: "Basic Salary", prefix: "Rs. " },
  { key: "grossPay", label: "Gross Pay", prefix: "Rs. " },
  { key: "netPay", label: "Net Pay", prefix: "Rs. " },
  { key: "bankName", label: "Bank Name" },
  { key: "accountNumber", label: "Account Number" },
  { key: "bps", label: "BPS" },
];

export function OCRPreview({ data, title = "Extracted Data (Please Verify)" }: OCRPreviewProps) {
  if (!data) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <h2 className="text-lg font-bold text-green-600 flex items-center gap-2 border-b pb-2">
        <CheckCircle2 size={20} /> {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {FIELDS.map(({ key, label, prefix }) => (
          <div key={key} className="bg-gray-50 p-3 rounded-lg">
            <span className="font-bold text-gray-700 block mb-1">{label}</span>
            {data[key] ? `${prefix ?? ""}${data[key]}` : "N/A"}
          </div>
        ))}
      </div>
    </div>
  );
}
