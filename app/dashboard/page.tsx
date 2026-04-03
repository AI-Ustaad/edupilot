'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase' // adjust path if needed
import { collection, onSnapshot } from 'firebase/firestore'
import { Users, UserCheck, CalendarCheck, Wallet } from 'lucide-react'

type Stats = {
  students: number
  staff: number
  attendance: number
  fees: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    students: 0,
    staff: 0,
    attendance: 0,
    fees: 0,
  })

  useEffect(() => {
    const unsubscribers: (() => void)[] = []

    try {
      // Students
      const studentsRef = collection(db, 'students')
      unsubscribers.push(
        onSnapshot(studentsRef, (snap) => {
          setStats((prev) => ({ ...prev, students: snap.size }))
        })
      )

      // Staff
      const staffRef = collection(db, 'staff')
      unsubscribers.push(
        onSnapshot(staffRef, (snap) => {
          setStats((prev) => ({ ...prev, staff: snap.size }))
        })
      )

      // Attendance
      const attendanceRef = collection(db, 'attendance')
      unsubscribers.push(
        onSnapshot(attendanceRef, (snap) => {
          setStats((prev) => ({ ...prev, attendance: snap.size }))
        })
      )

      // Fees
      const feesRef = collection(db, 'fees')
      unsubscribers.push(
        onSnapshot(feesRef, (snap) => {
          let total = 0
          snap.forEach((doc) => {
            total += doc.data()?.amount || 0
          })
          setStats((prev) => ({ ...prev, fees: total }))
        })
      )
    } catch (error) {
      console.error('Dashboard error:', error)
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub())
    }
  }, [])

  const cards = [
    {
      title: 'Students',
      value: stats.students,
      icon: Users,
    },
    {
      title: 'Staff',
      value: stats.staff,
      icon: UserCheck,
    },
    {
      title: 'Attendance',
      value: stats.attendance,
      icon: CalendarCheck,
    },
    {
      title: 'Fees (PKR)',
      value: stats.fees,
      icon: Wallet,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm p-5 border hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <h2 className="text-2xl font-bold mt-1">
                    {card.value}
                  </h2>
                </div>
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
