"use client";
import { useState, useMemo } from "react";
import { Loader2, Film, AlertCircle, Trash2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useClasses } from "@/hooks/useClasses";
import { useSettings } from "@/hooks/useSettings";
import { useVideos, useDeleteVideo } from "@/hooks/useVideos";
import { TableSkeleton } from "@/components/Skeletons";
import { extractUniqueClasses } from "@/lib/utils/formatClassLabel";

export default function VideoLecturesPage() {
  const [filterClass, setFilterClass] = useState("");
  const [filterSubject, setFilterSubject] = useState("");

  const { data: classesData = [] } = useClasses();
  const { data: settings } = useSettings();
  const subjects = settings?.subjects || [];
  const uniqueClasses = useMemo(() => extractUniqueClasses(classesData), [classesData]);

  const { data: videos = [], isLoading, isError } = useVideos(filterClass, filterSubject);
  const deleteMutation = useDeleteVideo();

  if (isLoading) {
    return (
      <div className="p-8">
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 flex flex-col items-center gap-3">
        <AlertCircle size={32} />
        Failed to load videos.
      </div>
    );
  }

  return (
    <RequirePermission permissions={[PERMISSIONS.videoLectures.view]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Film className="text-blue-600" /> Video Library
        </h1>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setFilterSubject("");
            }}
            className="bg-white border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Classes</option>
            {uniqueClasses.map((cls: string) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setFilterClass("");
              setFilterSubject("");
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            Clear Filters
          </button>
        </div>

        {videos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400 font-medium">
            No video lectures available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v: any) => (
              <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-3 mb-3">
                  <Film className="text-blue-600 w-8 h-8 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900">{v.title}</p>
                    <p className="text-xs text-gray-500 font-medium">{v.classGrade} • {v.subject}</p>
                  </div>
                </div>
                {v.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{v.description}</p>}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <a
                    href={v.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition"
                  >
                    Watch Now
                  </a>
                  <RequirePermission permissions={[PERMISSIONS.videoLectures.delete]}>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${v.title}"?`)) {
                          deleteMutation.mutate(v.id);
                        }
                      }}
                      disabled={deleteMutation.isPending && deleteMutation.variables === v.id}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                      title="Delete Video"
                    >
                      {deleteMutation.isPending && deleteMutation.variables === v.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </RequirePermission>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RequirePermission>
  );
}
