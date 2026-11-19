"use client";
import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, Loader2, RotateCcw, Check, Sparkles } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { useToast } from "@/components/ToastProvider";
import { safeObject } from "@/lib/api/safeResponse";

interface MenuItem {
  id: string;
  label: string;
  path: string;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "students", label: "All Students", path: "/students" },
  { id: "staff", label: "All Staff", path: "/staff" },
  { id: "payroll", label: "Payroll", path: "/payroll" },
  { id: "classes", label: "Classes & Academics", path: "/classes" },
  { id: "attendance", label: "Attendance", path: "/attendance" },
  { id: "exams", label: "Exam Management", path: "/exams" },
  { id: "marks", label: "Marks Entry", path: "/marks" },
  { id: "result", label: "Exam Results", path: "/result" },
  { id: "fees", label: "Fee Management", path: "/fees" },
  { id: "timetable", label: "Timetable", path: "/timetable" },
  { id: "ai-assistant", label: "AI Assistant", path: "/ai-chatbot" },
  { id: "parents", label: "Parent Directory", path: "/admin/parents" },
  { id: "school-setup", label: "School Setup", path: "/admin/school-setup" },
  { id: "audit", label: "Audit Center", path: "/admin/audit" },
  { id: "settings", label: "General Settings", path: "/settings/general" },
];

function SortableItem({ id, label, path, onRemove }: { id: string; label: string; path: string; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl mb-2 bg-white shadow-sm hover:border-blue-300 transition">
      <button {...listeners} {...attributes} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"><GripVertical size={20} /></button>
      <div className="flex-1 min-w-0">
        <span className="font-bold text-gray-800 text-sm block truncate">{label}</span>
        <span className="text-xs text-gray-400 font-mono block truncate">{path}</span>
      </div>
      <button onClick={() => onRemove(id)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition" title="Remove item"><Trash2 size={16} /></button>
    </div>
  );
}

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await apiClient.get("/menu");
        const data = safeObject(res);
        if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items);
        } else {
          setItems(DEFAULT_MENU_ITEMS);
        }
      } catch (err) {
        setItems(DEFAULT_MENU_ITEMS);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const addItem = () => {
    if (!newLabel.trim() || !newPath.trim()) return;
    setItems([...items, { id: `custom_${Date.now()}`, label: newLabel.trim(), path: newPath.trim() }]);
    setNewLabel("");
    setNewPath("");
    showToast("Menu item added! Don't forget to save.", "success");
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const resetToDefaults = () => {
    setItems(DEFAULT_MENU_ITEMS);
    showToast("Menu reset to defaults! Click save to apply.", "success");
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiClient.post("/menu", { items });
      showToast("Menu configuration saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save menu.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Custom Menu Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Reorder, add, or customize your school portal navigation menu.</p>
          </div>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition shadow-sm"
          >
            <RotateCcw size={14} /> Reset to Defaults
          </button>
        </div>

        {/* Add item bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 space-y-2">
          <label className="text-xs font-bold text-gray-700 block uppercase tracking-wide">Add Custom Navigation Link</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              placeholder="Display Label (e.g. Finance Dashboard)" 
              value={newLabel} 
              onChange={e => setNewLabel(e.target.value)} 
              className="border border-gray-300 p-2.5 rounded-xl flex-1 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50" 
            />
            <input 
              placeholder="Path (e.g. /fees)" 
              value={newPath} 
              onChange={e => setNewPath(e.target.value)} 
              className="border border-gray-300 p-2.5 rounded-xl flex-1 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono bg-gray-50" 
            />
            <button 
              onClick={addItem} 
              disabled={!newLabel.trim() || !newPath.trim()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 text-sm"
            >
              <Plus size={16} /> Add Link
            </button>
          </div>
        </div>

        {/* Drag and Drop list */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
          <div className="flex justify-between items-center px-1 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Menu Order ({items.length} Links)</span>
            <span className="text-xs text-gray-400">Drag items to rearrange</span>
          </div>
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (active.id !== over?.id) {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over?.id);
                if (oldIndex !== -1 && newIndex !== -1) {
                  const newItems = [...items];
                  const [removed] = newItems.splice(oldIndex, 1);
                  newItems.splice(newIndex, 0, removed);
                  setItems(newItems);
                }
              }
            }}
          >
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(item => (
                <SortableItem key={item.id} id={item.id} label={item.label} path={item.path} onRemove={removeItem} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <button 
          onClick={save} 
          disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-base disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          Save Menu Ordering
        </button>
      </div>
    </RequirePermission>
  );
}
