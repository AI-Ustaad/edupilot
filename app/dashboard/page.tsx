"use client";
import React from "react";
import { Users, GraduationCap, UserCheck, BookOpen, Search, Bell, Mail, Settings } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F8F9FE] font-sans text-[#4A5568]">
      {/* SIDEBAR - CLONE OF SCHOOL.PNG */}
      <aside className="w-72 bg-[#302B52] text-white flex flex-col p-8 rounded-r-[48px] shadow-2xl">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="bg-white p-2 rounded-2xl shadow-lg">
            <GraduationCap className="text-[#302B52] w-8 h-8" />
          </div>
          <span className="text-2xl font-black tracking-tight">EduPilot</span>
        </div>
        
        <nav className="space-y-6 flex-1">
          {['Dashboard', 'Students', 'Teachers', 'Parents', 'Attendance', 'Exam', 'Account', 'Settings'].map((item, i) => (
            <div 
              key={item} 
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${i === 0 ? 'bg-white/15 border-l-4 border-[#7166F9] shadow-inner' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
            >
              <BookOpen size={22} />
              <span className="text-lg font-semibold">{item}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-12">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-bold text-[#302B52]">Welcome to CPS</h2>
          <div className="flex gap-6 items-center">
             <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input type="text" placeholder="Search..." className="pl-12 pr-6 py-3.5 w-80 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-[#7166F9]" />
             </div>
             <div className="flex gap-3">
               <div className="bg-white p-3.5 rounded-2xl shadow-sm text-gray-500"><Mail size={22}/></div>
               <div className="bg-white p-3.5 rounded-2xl shadow-sm text-gray-500 relative">
                 <Bell size={22}/>
                 <div className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full border-2 border-white" />
               </div>
             </div>
             <img src="https://ui-avatars.com/api/?name=Admin&background=302B52&color=fff" className="w-14 h-14 rounded-2xl border-4 border-white shadow-lg" />
          </div>
        </header>

        {/* STATS GRID - 4 COLS */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Schools', value: '6000', color: 'border-red-400', icon: <Users /> },
            { label: 'Students', value: '25000', color: 'border-purple-600', icon: <GraduationCap /> },
            { label: 'Teachers', value: '3500', color: 'border-yellow-400', icon: <UserCheck /> },
            { label: 'Parents', value: '11020', color: 'border-green-400', icon: <Users /> },
          ].map((stat, i) => (
            <div key={i} className={`bg-white p-8 rounded-[32px] shadow-sm border-t-[10px] ${stat.color}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 font-bold text-sm uppercase tracking-wider mb-2">{stat.label}</p>
                  <h3 className="text-4xl font-black text-[#302B52]">{stat.value}</h3>
                </div>
                <div className="bg-[#F8F9FE] p-4 rounded-2xl text-gray-300">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 bg-white p-10 rounded-[40px] shadow-sm h-[450px]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-[#302B52]">Calender & Attendance</h3>
              <div className="bg-[#F8F9FE] px-4 py-2 rounded-xl text-sm font-bold text-gray-500 cursor-pointer hover:bg-gray-100">View All</div>
            </div>
            <div className="flex items-end justify-between h-64 gap-4 px-2">
               {[40, 70, 45, 90, 65, 80, 55, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-[#7166F9] rounded-2xl opacity-80 hover:opacity-100 transition-all cursor-pointer" style={{ height: `${h}%` }} />
               ))}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-sm flex flex-col">
             <h3 className="text-2xl font-black text-[#302B52] mb-8">Top Scorer</h3>
             <div className="space-y-6 flex-1">
                {[
                  { name: 'Jane Cooper', score: '99.99%', rank: '1st', color: 'bg-green-500' },
                  { name: 'Eleanor Pena', score: '99.76%', rank: '2nd', color: 'bg-purple-600' },
                  { name: 'Devon Lane', score: '99.50%', rank: '3rd', color: 'bg-yellow-500' }
                ].map((user, i) => (
                  <div key={i} className="flex items-center gap-5 p-4 rounded-3xl border border-gray-50 hover:bg-gray-50 transition-all">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                    <div>
                      <p className="font-black text-[#302B52]">{user.name}</p>
                      <p className="text-sm text-gray-400 font-bold">{user.score}</p>
                    </div>
                    <div className={`ml-auto px-4 py-1 rounded-xl text-white font-black text-sm ${user.color}`}>{user.rank}</div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
