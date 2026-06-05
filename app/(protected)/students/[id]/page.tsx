"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import StudentHeader from "@/features/students360/components/StudentHeader";

export default function Student360Page() {
  const params = useParams();
  const studentId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["student360", studentId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/students/${studentId}`);
      if (!res.ok) throw new Error("Not found");
      const json = await res.json();
      return json.data || json; // API response handling
    },
    enabled: !!studentId,
  });

  if (isLoading) return <div>Loading Profile...</div>;
  if (!data) return <div>Student not found.</div>;

  return (
    <div className="p-8">
      {/* StudentHeader expects StudentProfile type, pass real data here */}
      <StudentHeader student={data} healthScore={88} />
      {/* Rest of the widgets */}
    </div>
  );
}
