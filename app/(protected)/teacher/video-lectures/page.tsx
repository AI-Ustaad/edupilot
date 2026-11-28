"use client";
import { useState } from "react";
import { Loader2, Upload, Film, Trash2 } from "lucide-react";

// B12 round 3: see app/(protected)/video-lectures/page.tsx — this page
// shares the upload form and must likewise never be served from a stale
// static prerender pointing at an old bundle.
export const dynamic = "force-dynamic";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useVideos, useDeleteVideo } from "@/hooks/useVideos";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import VideoUploadForm from "@/components/VideoUploadForm";

export default function TeacherVideoLecturesPage() {
  const [videoToDelete, setVideoToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data: videos = [], isLoading } = useVideos();
  const deleteMutation = useDeleteVideo();

  const handleDelete = (id: string, title: string) => {
    setVideoToDelete({ id, title });
  };

  const handleConfirmDelete = () => {
    if (!videoToDelete) return;
    deleteMutation.mutate(videoToDelete.id, {
      onSettled: () => setVideoToDelete(null),
    });
  };

  if (isLoading) return <div className="p-8 text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Upload className="text-blue-600" /> Upload Video Lecture</h1>

      <RequirePermission permissions={[PERMISSIONS.videoLectures.create]}>
        <VideoUploadForm />
      </RequirePermission>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Uploaded Videos</h2>
        {videos.length === 0 ? <div className="bg-gray-50 border rounded-2xl p-8 text-center text-gray-500">No videos uploaded yet.</div> : (
          <div className="grid gap-3">
            {videos.map((v: any) => (
              <div key={v.id} className="bg-white border rounded-xl p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Film className="text-blue-600 w-8 h-8 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">{v.title}</p>
                    <p className="text-sm text-gray-500">{v.classGrade} • {v.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={v.videoUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-bold transition">Watch Video</a>
                  <RequirePermission permissions={[PERMISSIONS.videoLectures.delete]}>
                    <button
                      onClick={() => handleDelete(v.id, v.title)}
                      disabled={deleteMutation.isPending && deleteMutation.variables === v.id}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                      title="Delete Video"
                    >
                      {deleteMutation.isPending && deleteMutation.variables === v.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </RequirePermission>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!videoToDelete}
        title="Delete Video Lecture"
        description="Are you sure you want to delete this video lecture? It will be removed from both teacher and student video libraries."
        itemName={videoToDelete ? videoToDelete.title : undefined}
        isDeleting={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setVideoToDelete(null)}
      />
    </div>
  );
}
