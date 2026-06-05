export const dynamic = 'force-dynamic';
"use client";
import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  path: string;
}

interface SortableItemProps {
  id: string;
  label: string;
  onRemove: (id: string) => void;
}

function SortableItem({ id, label, onRemove }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 border rounded mb-2 bg-white">
      <button {...listeners} {...attributes}><GripVertical size={20} /></button>
      <span className="flex-1">{label}</span>
      <button onClick={() => onRemove(id)}><Trash2 size={16} /></button>
    </div>
  );
}

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newPath, setNewPath] = useState("");

  useEffect(() => {
    fetch("/api/menu")
      .then(res => res.json())
      .then(data => setItems(data.items || []));
  }, []);

  const addItem = () => {
    if (!newLabel || !newPath) return;
    setItems([...items, { id: Date.now().toString(), label: newLabel, path: newPath }]);
    setNewLabel("");
    setNewPath("");
  };

  const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));

  const save = async () => {
    await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    alert("Menu saved");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black mb-4">Custom Menu Manager</h1>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Label"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <input
          placeholder="/path"
          value={newPath}
          onChange={e => setNewPath(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button onClick={addItem} className="bg-blue-600 text-gray-900 px-3 rounded">
          <Plus size={18} />
        </button>
      </div>
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
          {items.map(item => (
            <SortableItem key={item.id} id={item.id} label={item.label} onRemove={removeItem} />
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={save} className="mt-4 bg-green-600 text-gray-900 px-4 py-2 rounded">
        Save Menu
      </button>
    </div>
  );
}
