"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Upload, Loader2, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// 🚀 نئی Hooks Import کریں
import { useStudents, useDeleteStudent } from "@/hooks/useStudents";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ocrUploading, setOcrUploading] = useState(false);

  // 1. Fetch Students using Custom Hook
  const { data: students = [], isLoading: isStudentsLoading, isError } = useStudents();
  
  // 2. Delete Mutation
  const deleteMutation = useDeleteStudent();

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
      // Note: You can later move this to a custom hook useUploadCSV()
      const res = await fetch("/api/v1/students/bulk", { method: "POST", body: formData });
      if (res.ok) {
        alert("Students imported successfully!");
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
        const res = await fetch("/api/v1/students/ocr-admission", { method: "POST", body: formData });
        const text = await res.text();
        if (!text) throw new Error("Empty response");
        const result = JSON.parse(text);

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
    return <div className="p-8 text-center flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-center flex flex-col justify-center items-center h-[60vh] gap-4">
        <AlertCircle className="text-red-500 w-12 h-12" />
        <h2 className="text-xl font-bold text-slate-800">Failed to load students</h2>
        <p className="text-slate-500">Please check your API or try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-black text-slate-900">Students Directory</h1>
        <div className="flex gap-3 flex-wrap">
          <RequirePermission permissions={[PERMISSIONS.students.create]}>
            <button onClick={handleOCRUpload} disabled={ocrUploading} className="bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-purple-700 transition disabled:opacity-50 font-bold shadow-sm">
              {ocrUploading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              {ocrUploading ? "Processing..." : "Upload OCR"}
            </button>
            <button onClick={handleImportCSV} className="bg-emerald-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-emerald-700 transition font-bold shadow-sm">
              <Upload size={18}/> Import CSV
            </button>
            <button onClick={() => router.push("/students/add")} className="bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-700 transition font-bold shadow-sm">
              <UserPlus size={18}/> Add New
            </button>
          </RequirePermission>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Name</th>
                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Class</th>
                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider">Roll No</th>
                <th className="p-5 font-bold text-slate-500 uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s: any, idx: number) => (
                <tr key={s.id || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-bold text-slate-800">{s.fullName || s.name || "N/A"}</td>
                  <td className="p-5 text-slate-600 font-medium">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-sm border border-blue-100">
                      {s.classGrade || "N/A"}
                    </span>
                  </td>
                  <td className="p-5 text-slate-600 font-medium">{s.rollNumber || "N/A"}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-4 items-center">
                      <Link href={`/students/${s.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition">
                        View 360°
                      </Link>
                      <RequirePermission permissions={[PERMISSIONS.students.delete]}>
                        <button 
                          onClick={() => handleDelete(s.id)} 
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          disabled={deleteMutation.isPending && deleteMutation.variables === s.id}
                        >
                          {deleteMutation.isPending && deleteMutation.variables === s.id ? 
                            <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18}/>
                          }
                        </button>
                      </RequirePermission>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium">No students found. Add one to get started!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
