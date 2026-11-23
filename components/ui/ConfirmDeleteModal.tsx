"use client";
import React, { useEffect } from "react";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this record? This action cannot be undone.",
  itemName,
  isDeleting = false,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 transform transition-all animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h3 id="confirm-delete-title" className="text-lg font-black text-gray-900">
                {title}
              </h3>
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              {description}
            </p>
            {itemName && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 break-all font-semibold">
                {itemName}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {isDeleting ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
