"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Users, School } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Fetch data for search (React Query will cache this, so no extra network calls)
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();

  // Keyboard Shortcut Listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const filteredStudents = students.filter((s: any) => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const filteredClasses = classes.filter((c: any) => 
    c.classGrade?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4" onClick={() => setIsOpen(false)}>
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search className="text-gray-400" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="Search students, classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 text-lg font-medium"
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {searchTerm === "" ? (
            <div className="p-8 text-center text-gray-400 font-medium">
              Start typing to search across your school...
            </div>
          ) : (
            <>
              {/* Students Section */}
              {filteredStudents.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Students</p>
                  {filteredStudents.map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        router.push(`/students/${s.id}`);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{s.fullName || s.name}</p>
                        <p className="text-xs text-gray-500">Class {s.classGrade} | Roll #{s.rollNumber}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Classes Section */}
              {filteredClasses.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Classes</p>
                  {filteredClasses.map((c: any) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        router.push(`/classes`);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <School size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Class {c.classGrade}</p>
                        <p className="text-xs text-gray-500">Section: {c.sectionName || c.section}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {filteredStudents.length === 0 && filteredClasses.length === 0 && (
              <div className="p-8 text-center text-gray-400 font-medium">
  No results found for &quot;{searchTerm}&quot;
</div>
              )}
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-100 p-3 flex items-center justify-between text-xs text-gray-400 font-medium bg-gray-50">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">ESC</kbd>
            <span>to close</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px]">Ctrl + K</kbd>
            <span>to open</span>
          </div>
        </div>
      </div>
    </div>
  );
}
