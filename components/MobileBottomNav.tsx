"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardCheck, Wallet } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/students", icon: Users, label: "Students" },
  { href: "/attendance", icon: ClipboardCheck, label: "Attendance" },
  { href: "/fees", icon: Wallet, label: "Fees" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="glass-card !rounded-3xl flex justify-around items-center py-3 px-2 shadow-glass">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${
                active ? "text-primary bg-white/20" : "text-slate-500"
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-bold uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
