"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();

  const [schoolType, setSchoolType] = useState("govt");
  const [board, setBoard] = useState("punjab");
  const [level, setLevel] = useState("primary");
  const [sections, setSections] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);

  const submit = async () => {
    await fetch("/api/setup/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        schoolType,
        board,
        level,
        sections,
        periods,
      }),
    });

    router.push("/dashboard");
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Setup School</h1>

      <select onChange={(e) => setSchoolType(e.target.value)}>
        <option value="govt">Govt</option>
        <option value="private">Private</option>
        <option value="madrissa">Madrissa</option>
      </select>

      <select onChange={(e) => setBoard(e.target.value)}>
        <option value="punjab">Punjab</option>
        <option value="federal">Federal</option>
      </select>

      <select onChange={(e) => setLevel(e.target.value)}>
        <option value="primary">Primary</option>
        <option value="elementary">Elementary</option>
        <option value="secondary">Secondary</option>
      </select>

      <input
        placeholder="Add Section (A,B)"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setSections([...sections, (e.target as any).value]);
            (e.target as any).value = "";
          }
        }}
      />

      <input
        placeholder="Add Period (1,2,3)"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            setPeriods([...periods, (e.target as any).value]);
            (e.target as any).value = "";
          }
        }}
      />

      <button onClick={submit}>Finish Setup</button>
    </div>
  );
}
