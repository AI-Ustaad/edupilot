"use client";
import { useState, useMemo } from "react";
import { Loader2, Send, Calendar, CheckCircle, Trash2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useHomework, useCreateHomework, useDeleteHomework } from "@/hooks/useHomework";
import { formatClassLabel, cleanSectionName, extractUniqueClasses } from "@/lib/utils/formatClassLabel";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";

export default function TeacherHomeworkPage() {
  // B25: single form object (same pattern that fixed the cross-reset on
  // Lesson Plans) — a dropdown change spreads the existing values, so it
  // can never drop an already-entered field. Only `section` is reset when
  // the class changes, because the section list depends on the class.
  const [form, setForm] = useState({
    title: "",
    description: "",
    classGrade: "",
    section: "",
    subject: "",
    dueDate: "",
  });
  const [success, setSuccess] = useState("");
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data: classes = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];
  
  const uniqueClasses = useMemo(() => extractUniqueClasses(classes), [classes]);
  const availableSections = useMemo(() => {
    if (!form.classGrade) return [];
    const norm = formatClassLabel(form.classGrade);
    const matched = classes.filter((c: any) => formatClassLabel(c.classGrade || c.name) === norm);
    const set = new Set<string>();
    matched.forEach((c: any) => {
      const s = cleanSectionName(c.sectionName || c.section);
      if (s) set.add(s);
    });
    return set.size > 0 ? Array.from(set).sort() : ["A", "B", "C"];
  }, [classes, form.classGrade]);

  const { data: assignments = [], isLoading: listLoading } = useHomework();
  const createMutation = useCreateHomework();
  const deleteMutation = useDeleteHomework(); // 🚀 Delete Hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { title: form.title, description: form.description, classGrade: form.classGrade, section: form.section, subject: form.subject, dueDate: form.dueDate || undefined },
      {
        onSuccess: () => {
          setSuccess("Homework posted successfully!");
          // Only the free-text fields are cleared after a successful post;
          // class / section / subject stay so the next homework can reuse them.
          setForm({ ...form, title: "", description: "", dueDate: "" });
          setTimeout(() => setSuccess(""), 3000);
        }
      }
    );
  };

  const handleDelete = (id: string, itemTitle: string) => {
    setItemToDelete({ id, title: itemTitle });
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteMutation.mutate(itemToDelete.id, {
      onSettled: () => setItemToDelete(null),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Homework Management</h1>
      {success && <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-4 font-bold flex items-center gap-2"><CheckCircle size={20} /> {success}</div>}

      <RequirePermission permissions={[PERMISSIONS.homework.create]}>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-gray-50 border rounded-xl p-3" required />
            <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} list="subject-list" className="bg-gray-50 border rounded-xl p-3" required />
            <datalist id="subject-list">{subjects.map(s => <option key={s} value={s} />)}</datalist>
            <select value={form.classGrade} onChange={e => setForm({ ...form, classGrade: e.target.value, section: "" })} className="bg-gray-50 border rounded-xl p-3" required>
              <option value="">Select Class</option>
              {uniqueClasses.map((cls: string) => <option key={cls} value={cls}>{cls}</option>)}
            </select>
            <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} className="bg-gray-50 border rounded-xl p-3 disabled:opacity-50" required disabled={!form.classGrade}>
              <option value="">Select Section</option>
              {availableSections.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-2 border bg-gray-50 rounded-xl p-3">
              <Calendar size={18} className="text-gray-400" />
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="bg-transparent outline-none w-full" />
            </div>
          </div>
          <textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-50 border rounded-xl p-3" required />
          <button type="submit" disabled={createMutation.isPending} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
            {createMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Post Homework
          </button>
        </form>
      </RequirePermission>

      <div>
        <h2 className="text-xl font-black text-gray-900 mb-4 border-b pb-2">Recently Posted</h2>
        {listLoading ? <Loader2 className="animate-spin mx-auto text-blue-600" size={32} /> : assignments.length === 0 ? (
          <div className="bg-gray-50 border rounded-xl p-8 text-center text-gray-500">No homework posted yet.</div>
        ) : (
          <div className="grid gap-4">
            {assignments.map((a: any) => (
              <div key={a.id} className={`bg-white border rounded-xl p-5 hover:shadow-md transition flex justify-between items-start ${deleteMutation.isPending && deleteMutation.variables === a.id ? 'opacity-50' : ''}`}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{a.title}</h3>
                    {a.dueDate && <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full border border-red-100 flex items-center gap-1"><Calendar size={12}/> Due: {a.dueDate}</span>}
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-md border border-blue-100">{a.classGrade} - {a.section}</span>
                    <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-md border border-purple-100">{a.subject}</span>
                  </div>
                  <p className="text-sm text-gray-600">{a.description}</p>
                </div>
                <RequirePermission permissions={[PERMISSIONS.homework.create]}>
                  <button 
                    onClick={() => handleDelete(a.id, a.title)} 
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === a.id ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                  </button>
                </RequirePermission>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title="Delete Homework"
        description="Are you sure you want to delete this homework assignment? Students will no longer see this task."
        itemName={itemToDelete ? itemToDelete.title : undefined}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
