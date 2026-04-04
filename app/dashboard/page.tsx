"use client";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, GraduationCap, CheckSquare, CreditCard, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    attendance: 0,
    revenue: 0,
  });

  // Real-time Firebase Listeners
  useEffect(() => {
    // Listen to Students
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStats((prev) => ({ ...prev, students: snapshot.size }));
    });

    // Listen to Staff
    const unsubStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
      setStats((prev) => ({ ...prev, staff: snapshot.size }));
    });

    // Listen to Attendance (Counting today's records as a placeholder)
    const unsubAttendance = onSnapshot(collection(db, "attendance"), (snapshot) => {
      setStats((prev) => ({ ...prev, attendance: snapshot.size }));
    });

    // Listen to Fees (Summing up total revenue)
    const unsubFees = onSnapshot(collection(db, "fees"), (snapshot) => {
      let totalRevenue = 0;
      snapshot.forEach((doc) => {
        totalRevenue += Number(doc.data().amount || 0);
      });
      setStats((prev) => ({ ...prev, revenue: totalRevenue }));
    });

    // Cleanup listeners when leaving page
    return () => {
      unsubStudents();
      unsubStaff();
      unsubAttendance();
      unsubFees();
    };
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time overview of your school's performance.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center gap-2">
          <TrendingUp size={16} /> Generate Report
        </button>
      </div>

      {/* Colorful Stats Cards (Matching Theme 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Students */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <GraduationCap size={28} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.students.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CreditCard size={28} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Capital Gains (PKR)</p>
            <h3 className="text-2xl font-bold text-gray-800">Rs {stats.revenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 3: Staff */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Users size={28} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Staff</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.staff.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 4: Attendance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <CheckSquare size={28} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Attendance Logs</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.attendance.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Placeholder for future charts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <TrendingUp size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-bold text-gray-700">Analytics Graph</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto mt-2">Add your first students and fees to see the growth chart populate here.</p>
        </div>
      </div>
    </div>
  );
}
