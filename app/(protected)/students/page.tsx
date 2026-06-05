"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Upload, Loader2, FileText, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ocrUploading, setOcrUploading] = useState(false);

  // 1. React Query کے ذریعے اسٹوڈنٹس کا ڈیٹا فیچ کرنا (Cached)
  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students", user?.tenantId],
    queryFn: async () => {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
    enabled: !!user?.tenantId && !authLoading,
  });

  // 2. ڈیلیٹ کا عمل (Auto-update list)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure?")) return;
    deleteMutation.mutate(id);
  };

  const handleImportCSV = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/students/bulk", { method: "POST", body: formData });
      if (res.ok) {
        alert("Students imported successfully!");
        queryClient.invalidateQueries({ queryKey: ["students"] });
      } else {
        alert("Import failed");
      }
    };
    input.click();
  };

  const handleOCRUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf,.docx";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      setOcrUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/students/ocr-admission", { method: "POST", body: formData });
        const result = await res.json();
        if (result.success && result.data) {
          sessionStorage.setItem("ocrStudentData", JSON.stringify(result.data));
          router.push("/students/add?ocr=true");
        } else {
          alert(result.error || "Failed to extract data");
        }
      } catch (err) {
        alert("OCR processing failed.");
      } finally {
        setOcrUploading(false);
      }
    };
    input.click();
  };

  if (authLoading || isStudentsLoading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" size={32}/></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-black">Students Directory</h1>
        <div className="flex gap-3 flex-wrap">
          {user?.role === "admin" && (
            <>
              <button onClick={handleOCRUpload} disabled={ocrUploading} className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-purple-700 transition disabled:opacity-50">
                {ocrUploading ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                {ocrUploading ? "Processing..." : "Upload Document (OCR)"}
              </button>
              <button onClick={handleImportCSV} className="bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-green-700 transition">
                <Upload size={20}/> Import CSV
              </button>
              <button onClick={() => router.push("/students/add")} className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-700 transition">
                <UserPlus size={20}/> Add New Student
              </button>
            </>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-5">Name</th>
              <th>Class</th>
              <th>Roll No</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s: any) => (
              <tr key={s.id} className="border-t hover:bg-slate-50 transition-colors">
                <td className="p-5 font-bold">{s.fullName || s.name}</td>
                <td className="p-5">{s.classGrade}</td>
                <td className="p-5">{s.rollNumber}</td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/student-profile?id=${s.id}`} className="text-blue-600 hover:underline text-sm font-bold">View</Link>
                    {user?.role === "admin" && (
                      <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                        {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18}/>}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={4} className="p-10 text-center text-slate-400">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
