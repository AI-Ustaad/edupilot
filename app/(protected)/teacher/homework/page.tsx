"use client";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

export default function TeacherHomeworkPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (res.ok) {
        setSuccess("Notice posted successfully!");
        setTitle("");
        setDescription("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        alert("Failed to post notice");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6">Post Homework / Notice</h1>
      {success && <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4">{success}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <input
          type="text"
          placeholder="Title (e.g., Math Homework)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Description or instructions..."
          rows={4}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          {saving ? "Posting..." : "Post Notice"}
        </button>
      </form>
    </div>
  );
}
