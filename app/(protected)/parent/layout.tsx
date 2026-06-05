"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Home } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* سادہ نیویگیشن بار */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
        <Link href="/parent/dashboard" className="font-bold text-xl text-blue-600 flex items-center gap-2">
          <Home size={20} /> EduPilot Parent
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </nav>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
