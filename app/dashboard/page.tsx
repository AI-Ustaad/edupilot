// Inside your Dashboard component Sidebar section:
<nav className="space-y-4 flex-1">
  {[
    { name: 'Dashboard', path: '/dashboard', icon: <BookOpen size={22}/> },
    { name: 'Students', path: '/students', icon: <Users size={22}/> },
    { name: 'Teachers', path: '/staff', icon: <UserCheck size={22}/> },
    { name: 'Attendance', path: '/attendance', icon: <ClipboardCheck size={22}/> },
    { name: 'Exam', path: '/marks', icon: <GraduationCap size={22}/> },
    { name: 'Account', path: '/fees', icon: <CreditCard size={22}/> },
    { name: 'Settings', path: '/settings', icon: <Settings size={22}/> }
  ].map((item) => (
    <Link href={item.path} key={item.name}>
      <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all mb-2 ${
        pathname === item.path ? 'bg-white/20 border-l-4 border-[#7166F9]' : 'hover:bg-white/10 opacity-70'
      }`}>
        {item.icon}
        <span className="text-lg font-semibold">{item.name}</span>
      </div>
    </Link>
  ))}
</nav>
