"use client";
import { useEffect, useState } from "react";
import { BookOpen, Search, Download, Loader2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";

export default function BookCenterPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/books")
      .then((res) => res.json())
      .then((data) => {
        // API ممکن ہے براہِ راست ارے دے یا { success: true, data: [...] }
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setBooks(list);
      })
      .catch((err) => console.error("Failed to fetch books:", err))
      .finally(() => setLoading(false));
  }, []);

  // فلٹر کردہ کتابیں (سرچ کے مطابق)
  const filteredBooks = books.filter(
    (book: any) =>
      book.title?.toLowerCase().includes(search.toLowerCase()) ||
      book.subject?.toLowerCase().includes(search.toLowerCase()) ||
      book.classGrade?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RequirePermission permissions={[PERMISSIONS.books.view]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 border-b pb-4">
          <BookOpen className="text-blue-600" /> Digital Book Center
        </h1>

        {/* سرچ بار */}
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

        {/* لوڈنگ اسٹیٹ */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredBooks.length === 0 ? (
          /* کوئی کتاب نہیں ملی */
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400 font-medium shadow-sm">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            {books.length === 0
              ? "No books available yet. Upload books via 'Manage Books'."
              : "No books match your search."}
          </div>
        ) : (
          /* کتابوں کی گرڈ */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book: any) => (
              <div
                key={book.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 leading-tight">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  {book.classGrade} • {book.subject}
                </p>
                {book.fileUrl && (
                  <a
                    href={book.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full bg-gray-50 hover:bg-gray-100 text-blue-600 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition border border-gray-200"
                  >
                    <Download size={16} /> Download PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
