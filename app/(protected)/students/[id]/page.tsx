"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertTriangle, User, Brain, Shield, ClipboardCheck, Wallet, BookOpen, Users, Bus, Heart, Clock } from "lucide-react";
import { useStudentDomain } from "@/hooks/runtime/useStudentDomain";
import { useStudentSync } from "@/hooks/api/useStudentSync";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import Image from "next/image";

// TABS... (آپ کے پرانے TABS ویسے ہی رہیں گے)

export default function Student360Page() {
  const params = useParams();
  const studentId = params?.id as string;
  const [activeTab, setActiveTab] = useState<string>("overview");

  // 1. ⚙️ THE ENGINE: اس پیج پر آتے ہی Sync Engine چیک کرے گا کہ ڈیٹا موجود ہے یا نہیں
  // اگر Kernel خالی ہے تو یہ ڈیٹا لائے گا، اگر موجود ہے تو کچھ نہیں کرے گا (Zero API Call)
  const { isSyncing } = useStudentSync(); 

  // 2. 🚰 THE SDK: سارا ڈیٹا Kernel سے لیں گے
  const { getStudent } = useStudentDomain();
  const student = getStudent(studentId);

  // Loading State
  if (!student && isSyncing) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <p className="text-gray-500 font-medium">Hydrating Student Domain...</p>
      </div>
    );
  }

  // Error State
  if (!student && !isSyncing) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-red-50 rounded-2xl border border-red-200 max-w-2xl mx-auto mt-10">
        <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Identity Not Found</h2>
        <p className="text-gray-600 mt-2">This student does not exist in the Enterprise Runtime Kernel.</p>
      </div>
    );
  }

  // باقی UI منطق (Tabs, Stats وغیرہ) آپ کا پرانا ہی رہے گا
  // صرف `student` اب براہ راست ہمارے Normalized Store سے آرہا ہے
  
  return (
    <RequirePermission permissions={[PERMISSIONS.students.view]}>
      {/* آپ کا پورا UI کوڈ یہاں آئے گا */}
      {/* بس جہاں `student.fullName` یا `student.status` استعمال کر رہے ہیں، 
          اسے ہماری `StudentEntity` (entities/student.entity.ts) کے مطابق تھوڑا ایڈجسٹ کرنا ہوگا */}
    </RequirePermission>
  );
}
