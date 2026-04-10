"use client";
import React from "react";
import { useAuth } from "../context/AuthContext"; 
import { TrendingUp, Users, GraduationCap, WalletCards } from "lucide-react";

export default function DashboardPage() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3ac47d]"></div>
      </div>
    );
  }

  // ہیڈنگ اور میسج کو رول کے حساب سے سیٹ کریں
  let greetingTitle = "Welcome to EduPilot!";
  let greetingSubtext = "Here is an overview of your workspace.";

  switch (role) {
    case "admin":
      greetingTitle = "Welcome back, Principal!";
      greetingSubtext = "Here is the complete overview of your school's performance.";
      break;
    case "teacher":
      greetingTitle = "Hello, Teacher!";
      greetingSubtext = "Manage your classes, students, and daily tasks here.";
      break;
    case "staff":
      greetingTitle = "Welcome, Staff!";
      greetingSubtext = "Manage daily operations and fee collections.";
      break;
    case "student":
      greetingTitle = "Hello, Student!";
      greetingSubtext = "View your attendance, results, and notices here.";
      break;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* --- Dynamic Welcome Header --- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">{greetingTitle}</h1>
          <p className="text-slate-500 text-sm mt-1">{greetingSubtext}</p>
        </div>
        
        <div className="bg-[#f0fdf4] px-4 py-2 rounded-xl border border-green-100">
           <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Current Session</p>
           <p className="text-sm font-semibold text-green-800">2026 - 2027</p>
        </div>
      </div>

      {/* --- Placeholder for Next Step (Analytics Cards) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 opacity-50">
         <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center h-32">
            <p className="text-sm font-medium text-gray-400">Card 1 (Coming Soon)</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center h-32">
            <p className="text-sm font-medium text-gray-400">Card 2 (Coming Soon)</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center h-32">
            <p className="text-sm font-medium text-gray-400">Card 3 (Coming Soon)</p>
         </div>
         <div className="bg-white p-6 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center h-32">
            <p className="text-sm font-medium text-gray-400">Card 4 (Coming Soon)</p>
         </div>
      </div>

    </div>
  );
}
