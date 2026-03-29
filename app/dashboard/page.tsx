"use client";
import { motion } from "framer-motion";
import { Users, GraduationCap, UserCheck, BookOpen, Search, Bell, Mail } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#F8F9FE] font-sans text-[#4A5568]">
      {/* 1. THE SLEEK PURPLE SIDEBAR */}
      <aside className="w-64 bg-[#302B52] text-white flex flex-col p-6 rounded-r-[40px] shadow-2xl">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="bg-white p-2 rounded-xl">
            <GraduationCap className="text-[#302B52] w-8 h-8" />
          </div>
          <span className="text-2xl font-bold tracking-tight">EduPilot</span>
        </div>
        
        <nav className="space-y-4 flex-1">
          {['Dashboard', 'Students', 'Teachers', 'Parents', 'Attendance'].map((item, i) => (
            <motion.div 
              whileHover={{ x: 10 }}
              key={item} 
              className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${i === 0 ? 'bg-white/10 border-l-4 border-[#7166F9]' : 'hover:bg-white/5'}`}
            >
              <BookOpen size={20} />
              <span className="font-medium">{item}</span>
            </motion.div>
          ))}
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* TOP HEADER */}
        <header className="flex justify-between items-center mb-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-[#7166F9]" />
          </div>
          <div className="flex gap-4 items-center">
             <div className="bg-white p-3 rounded-xl shadow-sm cursor-pointer"><Mail size={20}/></div>
             <div className="bg-white p-3 rounded-xl shadow-sm cursor-pointer border-t-4 border-purple-500"><Bell size={20}/></div>
             <img src="https://ui-avatars.com/api/?name=Admin" className="w-12 h-12 rounded-xl border-2 border-white shadow-md" />
          </div>
        </header>

        {/* 3. STATS GRID (Clone of school.png) */}
        <div className="grid grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Schools', value: '6000', color: 'border-red-400', icon: <Users /> },
            { label: 'Students', value: '25000', color: 'border-purple-500', icon: <GraduationCap /> },
            { label: 'Teachers', value: '3500', color: 'border-yellow-400', icon: <UserCheck /> },
            { label: 'Parents', value: '11020', color: 'border-green-400', icon: <Users /> },
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={i} className={`bg-white p-6 rounded-[24px] shadow-sm border-t-8 ${stat.color}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 font-medium mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-[#2D3748]">{stat.value}</h3>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl text-gray-400">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4. LOWER SECTION: CALENDAR & TOP SCORERS */}
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 bg-white p-8 rounded-[32px] shadow-sm h-96">
            <h3 className="text-xl font-bold mb-6">Attendance Overview</h3>
            <div className="flex items-end gap-4 h-64 border-b border-gray-100 pb-2">
               {/* Simplified Bar Chart Simulation */}
               {[60, 80, 45, 90, 70, 85].map((h, i) => (
                 <motion.div 
                  initial={{ height: 0 }} animate={{ height: `${h}%` }}
                  key={i} className="flex-1 bg-[#7166F9] rounded-t-lg opacity-80 hover:opacity-100 transition-opacity" 
                 />
               ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] shadow-sm">
             <h3 className="text-xl font-bold mb-6">Top Performers</h3>
             <div className="space-y-6">
                {['Jane Cooper', 'Eleanor Pena'].map((name, i) => (
                  <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 ${i === 0 ? 'bg-green-50 border border-green-100' : 'bg-purple-50 border border-purple-100'}`}>
                    <img src={`https://i.pravatar.cc/150?u=${name}`} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className="font-bold text-sm">{name}</p>
                      <p className="text-xs text-gray-500">99.9% Score</p>
                    </div>
                    <div className="ml-auto font-bold text-[#7166F9]">{i + 1}st</div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
