"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const [isOpen, setIsOpen] = useState(false);

  // Fetch from React Query Cache (جو Real-time Hook بھر رہا ہے)
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", tenantId],
    queryFn: () => [], // Fetch function empty ہے کیونکہ ڈیٹا Real-time میں Cache میں آ رہا ہے
    enabled: false,
    initialData: [],
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell size={20} className="text-gray-600" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-900">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm font-medium">No new notifications</div>
              ) : (
                notifications.slice(0, 10).map((notif: any) => (
                  <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition">
                    <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleString() : ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
