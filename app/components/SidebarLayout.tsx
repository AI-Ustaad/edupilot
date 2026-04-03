"use client";

import Link from "next/link";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5 space-y-4">
        <h2 className="text-xl font-bold">EduPilot</h2>

        <nav className="flex flex-col space-y-2">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/students">Students</Link>
          <Link href="/dashboard/staff">Staff</Link>
          <Link href="/dashboard/attendance">Attendance</Link>
          <Link href="/dashboard/fees">Fees</Link>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-100 p-6">{children}</div>
    </div>
  );
}
