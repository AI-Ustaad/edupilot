"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Users, UserCheck, CalendarCheck, Wallet } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    attendance: 0,
    fees: 0,
  });

  const schoolId = "demo-school"; // 🔥 IMPORTANT

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    const studentsRef = collection(db, "schools", schoolId, "students");
    const staffRef = collection(db, "schools", schoolId, "staff");
    const attendanceRef = collection(db, "schools", schoolId, "attendance");
    const feesRef = collection(db, "schools", schoolId, "fees");

    unsubscribers.push(
      onSnapshot(studentsRef, (snap) => {
        setStats((prev) => ({ ...prev, students: snap.size }));
      })
    );

    unsubscribers.push(
      onSnapshot(staffRef, (snap) => {
        setStats((prev) => ({ ...prev, staff: snap.size }));
      })
    );

    unsubscribers.push(
      onSnapshot(attendanceRef, (snap) => {
        setStats((prev) => ({ ...prev, attendance: snap.size }));
      })
    );

    unsubscribers.push(
      onSnapshot(feesRef, (snap) => {
        let total = 0;
        snap.forEach((doc) => {
          total += doc.data()?.amount || 0;
        });
        setStats((prev) => ({ ...prev, fees: total }));
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []);

  const cards = [
    { title: "Students", value: stats.students, icon: Users },
    { title: "Staff", value: stats.staff, icon: UserCheck },
    { title: "Attendance", value: stats.attendance, icon: CalendarCheck },
    { title: "Fees (PKR)", value: stats.fees, icon: Wallet },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl shadow">
              <p className="text-gray-500">{card.title}</p>
              <h2 className="text-2xl font-bold">{card.value}</h2>
              <Icon className="w-6 h-6 mt-2 text-blue-600" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
