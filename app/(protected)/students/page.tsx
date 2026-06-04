"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Upload, Loader2, FileText, ShieldOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth(); // فالتو API کال کو ختم کر دیا گیا ہے!
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ocrUploading, setOcrUploading] = useState(false);

  // React Query for Fetching Students
  const { data: students = [], isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students", user?.tenantId],
    queryFn: async () => {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
    enabled: !!user?.tenantId && !authLoading, // جب تک یوزر نہ آئے، کال نہیں کرنی
  });

  // React Query Mutation for Deleting Student (Auto-updates UI)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return id;
    },
    onSuccess: () => {
      // اس سے پیج ریفریش کیے بغیر لسٹ اپڈیٹ ہو جائے گی
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  // React Query Mutation for Permanent Deletion
  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/delete-student?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Unknown error");
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      alert("Student data permanently deleted.");
    },
    onError: (error) => {
      alert("Failed: " + error.message);
    }
  });

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure?")) return;
    deleteMutation.mutate(id);
  };

  const handlePermanentDelete = (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the student and all related data (attendance, marks, fees, submissions)!")) return;
    permanentDeleteMutation.mutate(id);
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
        queryClient.invalidateQueries({ queryKey: ["students"] }); // آٹو ریفریش
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
        const res = await fetch("/api/students/ocr-admission", {
          method: "POST",
          body: formData,
        });
        const result = await res.json();

        if (result.success && result.data) {
          sessionStorage.setItem("ocrStudentData", JSON.stringify(result.data));
          router.push("/students/add?ocr=true");
        } else {
          alert(result.error || "Failed to extract data from document");
        }
      } catch (err) {
        alert("OCR processing failed. Please try again.");
      } finally {
        setOcrUploading(false);
      }
    };
    input.click();
  };

  if (authLoading || isStudentsLoading) {
    return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h1 className="text-3xl font-black text-gray-900">Students Directory</h1>
        <div className="flex gap-3 flex-wrap">
          {user?.role === "admin" && (
            <>
              <button
                onClick={handleOCRUpload}
                disabled={ocrUploading}
                className="bg-purple-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-purple-700 transition disabled:opacity-50"
              >
                {ocrUploading ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                {ocrUploading ? "Processing..." : "Upload Document (OCR)"}
              </button>
              <button
                onClick={handleImportCSV}
                className="bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-green-700 transition"
              >
                <Upload size={20}/> Import CSV
              </button>
              <button
                onClick={() => router.push("/students/add")}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <UserPlus size={20}/> Add New Student
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 text-gray-600 font-bold uppercase text-sm">Name</th>
              <th className="text-gray-600 font-bold uppercase text-sm">Class</th>
              <th className="text-gray-600 font-bold uppercase text-sm">Roll No</th>
              <th className="text-right text-gray-600 font-bold uppercase text-sm pr-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 font-bold text-gray-900">{s.fullName || s.name}</td>
                <td className="text-gray-700">{s.classGrade}</td>
                <td className="text-gray-700">{s.rollNumber}</td>
                <td className="text-right pr-5">
                  <div className="flex justify-end gap-3 items-center">
                    <Link href={`/student/360?id=${s.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      View 360°
                    </Link>
                    {user?.role === "admin" && (
                      <>
                        <button 
                          onClick={() => handleDelete(s.id)} 
                          disabled={deleteMutation.isPending}
                          className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                          title="Soft Delete"
                        >
                          {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin"/> : <Trash2 size={18}/>}
                        </button>
                        <button 
                          onClick={() => handlePermanentDelete(s.id)} 
                          disabled={permanentDeleteMutation.isPending}
                          className="text-red-700 hover:text-red-900 bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-bold transition-colors disabled:opacity-50"
                          title="Wipe Data Permanently"
                        >
                          {permanentDeleteMutation.isPending ? <Loader2 size={16} className="animate-spin"/> : <ShieldOff size={16} />}
                          Wipe
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400 font-medium">
                  No students found. Add a student to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
