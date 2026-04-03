"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

export default function StudentsPage() {
  const [name, setName] = useState("");
  const [students, setStudents] = useState<string[]>([]);

  const schoolId = "demo-school";

  const fetchStudents = async () => {
    const snap = await getDocs(
      collection(db, "schools", schoolId, "students")
    );

    const list: string[] = [];
    snap.forEach((doc) => list.push(doc.data().name));
    setStudents(list);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const addStudent = async () => {
    if (!name) return;

    await addDoc(
      collection(db, "schools", schoolId, "students"),
      { name }
    );

    setName("");
    fetchStudents();
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Students</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Student name"
        className="border p-2 mr-2"
      />

      <button
        onClick={addStudent}
        className="bg-blue-600 text-white px-4 py-2"
      >
        Add
      </button>

      <ul className="mt-4 space-y-2">
        {students.map((s, i) => (
          <li key={i} className="bg-white p-2 rounded shadow">
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
