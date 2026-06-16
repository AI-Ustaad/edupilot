"use client";
import { useState } from "react";
import { BookOpen, Search, Download } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";

export default function BookCenterPage() {
  const [search, setSearch] = useState("");

  const books = [
    { id: 1, title: "Advanced Mathematics", grade: "Grade 10", subject: "Math", url: "#" },
    { id: 2, title: "Physics Fundamentals", grade: "Grade 9", subject: "Physics", url: "#" },
    { id: 3, title: "World History", grade: "Grade 8", subject: "History", url: "#" },
  ];

  return (
    <RequirePermission permissions={["books.view" as any]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
          <BookOpen className="text-blue-600" /> Digital Book Center
        </h1>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search books by title, subject, or grade..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.filter(b => b.title.toLowerCase().includes(search.toLowerCase())).map(book => (
            <div key={book.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{book.title}</h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">{book.grade} • {book.subject}</p>
              <button className="mt-4 w-full bg-gray-50 hover:bg-gray-100 text-blue-600 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition border border-gray-200">
                <Download size={16} /> Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </RequirePermission>
  );
}
