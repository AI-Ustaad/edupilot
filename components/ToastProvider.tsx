"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X, Undo } from "lucide-react";

type ToastType = "success" | "error" | "info" | "undo";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  onUndo?: () => void;
}

const ToastContext = createContext<{
  showToast: (message: string, type?: ToastType, onUndo?: () => void) => void;
} | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success", onUndo?: () => void) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, onUndo }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border min-w-[300px] ${
                toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
                toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
                toast.type === "undo" ? "bg-blue-50 border-blue-200 text-blue-800" :
                "bg-gray-50 border-gray-200 text-gray-800"
              }`}
            >
              {toast.type === "success" && <CheckCircle size={20} className="text-green-600" />}
              {toast.type === "error" && <AlertCircle size={20} className="text-red-600" />}
              {toast.type === "info" && <Info size={20} className="text-gray-600" />}
              {toast.type === "undo" && <Info size={20} className="text-blue-600" />}
              
              <p className="flex-1 text-sm font-bold">{toast.message}</p>
              
              {toast.onUndo && (
                <button
                  onClick={() => {
                    toast.onUndo();
                    removeToast(toast.id);
                  }}
                  className="flex items-center gap-1 text-xs font-black uppercase text-blue-600 hover:text-blue-800 transition"
                >
                  <Undo size={14} /> Undo
                </button>
              )}
              
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
