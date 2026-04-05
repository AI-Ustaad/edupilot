"use client";
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, GraduationCap, CheckSquare, CreditCard, TrendingUp } from "lucide-react";
// ہم نے گراف کے لیے Recharts کو امپورٹ کر لیا ہے
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    attendance: 0,
    revenue: 0,
  });

  // Real-time Firebase Listeners (یہ آپ کا لائیو ڈیٹا لا رہے ہیں)
  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      setStats((prev) => ({ ...prev, students: snapshot.size }));
    });

    const unsubStaff = onSnapshot(collection(db, "staff"), (snapshot) => {
      setStats((prev) => ({ ...prev, staff: snapshot.size }));
    });

    const unsubAttendance = onSnapshot(collection(db, "attendance"), (snapshot) => {
      setStats((prev) => ({ ...prev, attendance: snapshot.size }));
    });

    const unsubFees = onSnapshot(collection(db, "fees"), (snapshot) => {
      let totalRevenue = 0;
      snapshot.forEach((doc) => {
        totalRevenue += Number(doc.data().amount || 0);
      });
      setStats((prev) => ({ ...prev, revenue: totalRevenue }));
    });

    return () => {
      unsubStudents();
      unsubStaff();
      unsubAttendance();
      unsubFees();
    };
  }, []);

  // یہ ہے ہمارے گراف کا ڈیٹا! 
  // اس میں 'Apr' (موجودہ مہینے) کے اندر ہم نے آپ کا Live 'stats.students' ڈال دیا ہے
  const chartData = [
    { name: 'Jan', students: 2 },
    { name: 'Feb', students: 4 },
    { name: 'Mar', students: 5 },
    { name: 'Apr', students: stats.students }, // <--- Live Firebase Data!
  ];

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

      {/* Colorful Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <GraduationCap size={28} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.students.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CreditCard size={28} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Capital Gains (PKR)</p>
            <h3 className="text-2xl font-bold text-gray-800">Rs {stats.revenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <Users size={28} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Active Staff</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.staff.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <CheckSquare size={28} className="text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Attendance Logs</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.attendance.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* NEW: Live Recharts Graph */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Student Growth Overview</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3ac47d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3ac47d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area 
                type="monotone" 
                dataKey="students" 
                stroke="#3ac47d" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorStudents)" 
                activeDot={{ r: 6, fill: '#3ac47d', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
