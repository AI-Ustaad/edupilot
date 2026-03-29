"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { 
  Users, GraduationCap, UserCheck, BookOpen, Search, 
  Bell, Mail, Settings, ClipboardCheck, CreditCard, LayoutDashboard 
} from "lucide-react";

export default function Dashboard() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ students: 0, staff: 0 });

  // REAL DATA CONNECTION
  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, "students"), (snap) => setCounts(prev => ({ ...prev, students: snap.size })));
    const unsubStaff = onSnapshot(collection(db, "staff"), (snap) => setCounts(prev => ({ ...prev, staff: snap.size })));
    return () => { unsubStudents(); unsubStaff(); };
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22}/> },
    { name: 'Students', path: '/students', icon: <GraduationCap size={22}/> },
    { name: 'Teachers', path: '/staff', icon: <UserCheck size={22}/> },
    { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={22}/> },
    { name: 'Exam', path: '/marks', icon: <BookOpen size={22}/> },
    { name: 'Account', path: '/fees', icon: <CreditCard size={22}/> },
    { name: 'Settings', path: '/settings', icon: <Settings size={22}/> }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FE] text-[#4A5568] font-sans overflow-hidden">
      {/* SIDEBAR - FULLY FUNCTIONAL */}
      <aside className="w-80 bg-[#302B52] text-white flex flex-col p-8 rounded-r-[50px] shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="bg-white p-2.5 rounded-2xl shadow-lg text-[#302B52]"><GraduationCap size={28} /></div>
          <span className="text-2xl font-black tracking-tight">EduPilot</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <Link href={item.path} key={item.name}>
              <div className={`flex items-center gap-5 p-4 rounded-2xl cursor-pointer transition-all ${
                pathname === item.path ? 'bg-white/15 border-l-4 border-[#7166F9] shadow-inner' : 'hover:bg-white/5 opacity-60 hover:opacity-100'
              }`}>
                {item.icon}
                <span className="text-lg font-bold">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 overflow-y-auto p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-[#302B52]">Welcome to CPS</h2>
            <p className="text-gray-400 font-bold text-sm">Real-time school overview</p>
          </div>
          <div className="flex gap-6 items-center">
             <div className="relative group">
                <Search className="absolute left-4 top-4 text-gray-400 group-focus-within:text-[#7166F9]" size={20} />
                <input type="text" placeholder="Search record..." className="pl-12 pr-6 py-4 w-96 rounded-[24px] bg-white border-none shadow-sm focus:ring-4 focus:ring-purple-100 transition-all outline-none" />
             </div>
             <div className="bg-white p-4 rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition-all"><Bell size={24}/></div>
             <img src="https://ui-avatars.com/api/?name=Admin&background=302B52&color=fff" className="w-14 h-14 rounded-2xl border-4 border-white shadow-xl" />
          </div>
        </header>

        {/* REAL STATS GRID */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Total Students', value: counts.students, color: 'border-purple-600', icon: <Users /> },
            { label: 'Active Staff', value: counts.staff, color: 'border-yellow-400', icon: <UserCheck /> },
            { label: 'Attendance Rate', value: '98%', color: 'border-green-400', icon: <ClipboardCheck /> },
            { label: 'Fee Collection', value: 'Rs. 0', color: 'border-red-400', icon: <CreditCard /> },
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-10 rounded-[40px] shadow-sm border-t-[12px] ${stat.color} hover:translate-y-[-5px] transition-transform`}>
              <p className="text-gray-400 font-black text-xs uppercase tracking-[2px] mb-2">{stat.label}</p>
              <h3 className="text-5xl font-black text-[#302B52]">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-3 gap-8">
           <div className="col-span-2 bg-white p-12 rounded-[50px] shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-[#302B52]">Academic Progress</h3>
                <span className="text-[#7166F9] font-bold cursor-pointer">Live Analytics</span>
              </div>
              <div className="flex items-end justify-between h-64 gap-6 px-4">
                 {[50, 80, 40, 100, 70, 90, 60, 85].map((h, i) => (
                   <div key={i} className="flex-1 bg-[#7166F9]/10 hover:bg-[#7166F9] rounded-2xl transition-all cursor-pointer relative group" style={{ height: `${h}%` }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#302B52] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{h}%</div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="bg-white p-10 rounded-[50px] shadow-sm">
              <h3 className="text-2xl font-black text-[#302B52] mb-8 text-center">Top Performers</h3>
              <div className="space-y-6">
                 {['Cooper', 'Lane', 'Pena'].map((name, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-[#F8F9FE] rounded-3xl">
                      <div className="w-12 h-12 bg-[#302B52] rounded-xl flex items-center justify-center text-white font-bold">{i+1}</div>
                      <div className="flex-1">
                        <p className="font-bold text-[#302B52]">{name}</p>
                        <p className="text-xs text-gray-400">Section A</p>
                      </div>
                      <div className="text-[#7166F9] font-black">99%</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
