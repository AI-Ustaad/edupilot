"use client";
import { useAuth } from "@/app/context/AuthContext"; 

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="p-8 font-bold text-[#3ac47d]">Loading secure environment...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Secure Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      
      <button 
        onClick={logout}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold shadow-md"
      >
        Sign Out Safely
      </button>
    </div>
  );
}
