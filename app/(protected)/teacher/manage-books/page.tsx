"use client";
import { useState } from "react";
import { Loader2, Plus, Upload, Film } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useBooks, useCreateBook } from "@/hooks/useTeacher";
import { TableSkeleton } from "@/components/Skeletons";

export default function ManageBooksPage() {
  const { data: books = [], isLoading } = useBooks();
  const { data: classes = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];
  const createMutation = useCreateBook();

  const [form, setForm] = useState({ title: "", classGrade: "", subject: "", fileUrl: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, { onSuccess: () => setForm({ title: "", classGrade: "", subject: "", fileUrl: "" }) });
  };

  if (isLoading) return <div className="p-8"><TableSkeleton rows={4} cols={4} /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Upload className="text-blue-600" /> Manage Books</h1>

      <RequirePermission permissions={[PERMISSIONS.bookCenter.create]}>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Book</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Book Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required />
            <select value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required>
              <option value="">Select Class</option>
              {classes.map((c: any) => <option key={c.id} value={c.classGrade}>{c.classGrade}</option>)}
            </select>
            <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required>
              <option value="">Select Subject</option>
              {subjects.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="File URL (PDF Link)" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required />
            <button type="submit" disabled={createMutation.isPending} className="col-span-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />} Save Book
            </button>
          </form>
        </div>
      </RequirePermission>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Class</th>
              <th className="p-4 text-left">Subject</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan={3} className="p-6 text-center text-gray-400">No books added yet.</td></tr>
            ) : (
              books.map(b => (
                <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{b.title}</td>
                  <td className="p-4 text-gray-600">{b.classGrade}</td>
                  <td className="p-4 text-gray-600">{b.subject}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
