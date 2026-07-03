"use client";
import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import apiClient from "@/lib/api/client";
import { useToast } from "@/components/ToastProvider";

interface MenuItem {
  id: string;
  label: string;
  path: string;
}

function SortableItem({ id, label, onRemove }: { id: string; label: string; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg mb-2 bg-white shadow-sm">
      <button {...listeners} {...attributes} className="text-gray-400 hover:text-gray-600"><GripVertical size={20} /></button>
      <span className="flex-1 font-medium text-gray-700">{label}</span>
      <button onClick={() => onRemove(id)} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-md"><Trash2 size={16} /></button>
    </div>
  );
}

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await apiClient.get("/menu");
        setItems(res.items || res.data?.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const addItem = () => {
    if (!newLabel || !newPath) return;
    setItems([...items, { id: Date.now().toString(), label: newLabel, path: newPath }]);
    setNewLabel("");
    setNewPath("");
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const save = async () => {
    try {
      await apiClient.post("/menu", { items });
      showToast("Menu saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save menu.", "error");
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900">Custom Menu Manager</h1>
        <p className="text-sm text-gray-500">Drag and drop items to reorder your sidebar menu.</p>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-2">
          <input placeholder="Label (e.g., Finance)" value={newLabel} onChange={e => setNewLabel(e.target.value)} className="border border-gray-300 p-2 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-blue-500" />
          <input placeholder="/path (e.g., /finance)" value={newPath} onChange={e => setNewPath(e.target.value)} className="border border-gray-300 p-2 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={addItem} className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg transition font-bold flex items-center justify-center"><Plus size={18} /></button>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (active.id !== over?.id) {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over?.id);
                const newItems = [...items];
                [newItems[oldIndex], newItems[newIndex]] = [newItems[newIndex], newItems[oldIndex]];
                setItems(newItems);
              }
            }}
          >
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(item => <SortableItem key={item.id} id={item.id} label={item.label} onRemove={removeItem} />)}
            </SortableContext>
          </DndContext>
        </div>

        <button onClick={save} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-3 rounded-xl transition shadow-sm">
          Save Menu Ordering
        </button>
      </div>
    </RequirePermission>
  );
}
