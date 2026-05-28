"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus, Upload, Loader2, FileText, ShieldOff } from "lucide-react";
import Link from "next/link";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [ocrUploading, setOcrUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, sRes] = await Promise.all([
          fetch("/api/users/get"),
          fetch("/api/students"),
        ]);
        const userData = await uRes.json();
        const studentsData = await sRes.json();
        setUser(userData);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the student and all related data (attendance, marks, fees, submissions)!")) return;
    const res = await fetch(`/api/admin/delete-student?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setStudents(prev => prev.filter(s => s.id !== id));
      alert("Student data permanently deleted.");
    } else {
      const err = await res.json();
      alert("Failed: " + (err.message || "Unknown error"));
    }
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
        window.location.reload();
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

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" size={32}/></div>;

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
                className="bg-green-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2"
              >
                <Upload size={20}/> Import CSV
              </button>
              <button
                onClick={() => router.push("/students/add")}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2"
              >
                <UserPlus size={20}/> Add New Student
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-5 text-gray-600">Name</th>
              <th className="text-gray-600">Class</th>
              <th className="text-gray-600">Roll No</th>
              <th className="text-right text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="p-5 font-bold text-gray-900">{s.fullName || s.name}</td>
                <td className="text-gray-700">{s.classGrade}</td>
                <td className="text-gray-700">{s.rollNumber}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/student/360?id=${s.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                      View 360
                    </Link>
                    {user?.role === "admin" && (
                      <>
                        <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={18}/>
                        </button>
                        <button onClick={() => handlePermanentDelete(s.id)} className="text-red-700 hover:text-red-900 flex items-center gap-1 text-sm font-medium">
                          <ShieldOff size={16} />
                          Delete Permanently
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-gray-400">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
