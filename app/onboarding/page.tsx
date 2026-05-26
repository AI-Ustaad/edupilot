"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  School, Users, BookOpen, Upload, Check, ArrowLeft, ArrowRight,
  GraduationCap, ClipboardList, X, Plus, Image
} from "lucide-react";
import { schoolTypes, getLevelsForSchoolType } from "@/lib/curriculum-data";

// ─── مددگار: تصویر کو base64 میں تبدیل کرنا ─────────────────
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

// ─── اسٹاف کیٹیگریز ───────────────────────────────────────
const STAFF_CATEGORIES = [
  "Principal",
  "Vice Principal",
  "Teacher",
  "Supporting Staff",
  "Admin",
] as const;

// ─── سپورٹنگ اسٹاف کی ذیلی اقسام ───────────────────────────
const SUPPORTING_SUB = [
  "Lab Assistant",
  "Librarian",
  "Peon",
  "Security Guard",
  "Gardener",
  "Cleaner",
  "Driver",
  "Conductor",
];

// ─── ایڈمن رولز ────────────────────────────────────────────
const ADMIN_ROLES = [
  "Accountant",
  "Registrar",
  "HR Manager",
  "IT Support",
  "Office Clerk",
];

// ─── دستیاب مضامین (بعد میں سیٹنگز سے بھی آ سکتے ہیں) ─────
const ALL_SUBJECTS = [
  "English", "Urdu", "Mathematics", "Islamiat", "Physics",
  "Chemistry", "Biology", "Computer Science", "Pakistan Studies",
  "Arabic", "Drawing", "Physical Education"
];

// ─── ایک اندراج کی قسم ─────────────────────────────────────
interface StaffEntry {
  id: string;
  category: string;
  details: any;   // teacher: { subjects: string[], isPET: boolean }
  quantity: number;
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // مرحلہ 1 – اسکول کی معلومات
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState("federal");
  const [schoolLevel, setSchoolLevel] = useState("primary");
  const availableLevels = getLevelsForSchoolType(schoolType as any);

  // مرحلہ 2 – اسٹاف
  const [staffList, setStaffList] = useState<StaffEntry[]>([]);
  const [currentCategory, setCurrentCategory] = useState("");
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [isPET, setIsPET] = useState(false);
  const [supportingSub, setSupportingSub] = useState("");
  const [adminRole, setAdminRole] = useState("");
  const [quantity, setQuantity] = useState(1);

  // مرحلہ 3 – لوگو و بینر
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [bannerBase64, setBannerBase64] = useState<string | null>(null);

  // عمومی
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ─── مرحلہ 2: اسٹاف اندراج شامل کریں ───────────────────
  const handleAddStaff = () => {
    if (!currentCategory) return;
    const id = Date.now().toString();
    let details = {};

    if (currentCategory === "Teacher") {
      if (teacherSubjects.length === 0 && !isPET) return; // کم از کم کچھ تو منتخب ہو
      details = { subjects: teacherSubjects, isPET };
    } else if (currentCategory === "Supporting Staff") {
      if (!supportingSub) return;
      details = { subCategory: supportingSub };
    } else if (currentCategory === "Admin") {
      if (!adminRole) return;
      details = { role: adminRole };
    }

    const newEntry: StaffEntry = {
      id,
      category: currentCategory,
      details,
      quantity,
    };
    setStaffList([...staffList, newEntry]);

    // فارم ری سیٹ
    setCurrentCategory("");
    setTeacherSubjects([]);
    setIsPET(false);
    setSupportingSub("");
    setAdminRole("");
    setQuantity(1);
  };

  const handleRemoveStaff = (id: string) => {
    setStaffList(staffList.filter((e) => e.id !== id));
  };

  // ─── مرحلہ 3: تصویر اپ لوڈ ──────────────────────────────
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoBase64(await toBase64(file));
  };
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBannerBase64(await toBase64(file));
  };

  // ─── حتمی جمع کروائیں ──────────────────────────────────
  const handleFinish = async () => {
    if (!schoolName.trim()) {
      setError("Please enter school name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          schoolName: schoolName.trim(),
          schoolType,
          schoolLevel,
          staffList,
          logoBase64,
          bannerBase64,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save");
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── UI مددگار ──────────────────────────────────────────
  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const inputClass = "w-full bg-white/60 backdrop-blur-md border border-white/30 rounded-xl p-3 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50";
  const labelClass = "text-sm font-bold text-slate-700 mb-1 block";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#e0f0ff] via-[#f0e6ff] to-[#ffe6f0]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl"
      >
        <div className="glass-card p-8 md:p-10">
          {/* پروگریس بار */}
          <div className="flex items-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i + 1 <= step ? "bg-primary" : "bg-white/20"
                }`}
              />
            ))}
            <span className="text-xs text-slate-500 ml-2">{step}/{totalSteps}</span>
          </div>

          {/* ── مرحلہ 1: اسکول کی معلومات ───────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <School className="text-primary" size={24} /> School Details
              </h2>
              <div>
                <label className={labelClass}>School Name</label>
                <input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Punjab Public School"
                />
              </div>
              <div>
                <label className={labelClass}>School Type</label>
                <select value={schoolType} onChange={(e) => setSchoolType(e.target.value)} className={inputClass}>
                  {schoolTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>School Level</label>
                <select value={schoolLevel} onChange={(e) => setSchoolLevel(e.target.value)} className={inputClass}>
                  {availableLevels.map((l: any) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── مرحلہ 2: اسٹاف کی تفصیلات ────────────────── */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Users className="text-primary" size={24} /> Staff Structure
              </h2>
              <p className="text-slate-500 text-sm">
                Add each category of staff you need. You can refine details in the admin panel later.
              </p>

              {/* فارم */}
              <div className="glass-card !bg-white/20 p-4 space-y-3">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={currentCategory} onChange={(e) => setCurrentCategory(e.target.value)} className={inputClass}>
                    <option value="">-- Select Category --</option>
                    {STAFF_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* ذیلی معلومات */}
                {currentCategory === "Teacher" && (
                  <div>
                    <label className={labelClass}>Subjects (select at least one)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ALL_SUBJECTS.map((sub) => (
                        <label key={sub} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={teacherSubjects.includes(sub)}
                            onChange={(e) => {
                              if (e.target.checked) setTeacherSubjects([...teacherSubjects, sub]);
                              else setTeacherSubjects(teacherSubjects.filter((s) => s !== sub));
                            }}
                          />
                          {sub}
                        </label>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 mt-2 text-sm">
                      <input type="checkbox" checked={isPET} onChange={(e) => setIsPET(e.target.checked)} />
                      Include PET (Physical Education Teacher)
                    </label>
                  </div>
                )}

                {currentCategory === "Supporting Staff" && (
                  <select value={supportingSub} onChange={(e) => setSupportingSub(e.target.value)} className={inputClass}>
                    <option value="">-- Select Sub-Category --</option>
                    {SUPPORTING_SUB.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                )}

                {currentCategory === "Admin" && (
                  <select value={adminRole} onChange={(e) => setAdminRole(e.target.value)} className={inputClass}>
                    <option value="">-- Select Admin Role --</option>
                    {ADMIN_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                )}

                <div>
                  <label className={labelClass}>Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>

                <button onClick={handleAddStaff} className="btn-primary flex items-center gap-2">
                  <Plus size={18} /> Add Staff Entry
                </button>
              </div>

              {/* محفوظ کردہ فہرست */}
              {staffList.length > 0 && (
                <div className="glass-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-left">Details</th>
                        <th className="p-3 text-left">Qty</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((entry) => (
                        <tr key={entry.id} className="border-t border-white/10">
                          <td className="p-3 font-bold">{entry.category}</td>
                          <td className="p-3 text-xs">
                            {entry.category === "Teacher" &&
                              `${entry.details.subjects.join(", ")}${entry.details.isPET ? " + PET" : ""}`}
                            {entry.category === "Supporting Staff" && entry.details.subCategory}
                            {entry.category === "Admin" && entry.details.role}
                            {(entry.category === "Principal" || entry.category === "Vice Principal") && "—"}
                          </td>
                          <td className="p-3">{entry.quantity}</td>
                          <td className="p-3 text-right">
                            <button onClick={() => handleRemoveStaff(entry.id)} className="text-red-400 hover:text-red-600">
                              <X size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── مرحلہ 3: لوگو و بینر اپ لوڈ ───────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Image className="text-primary" size={24} /> School Branding
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>School Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
                  {logoBase64 && <img src={logoBase64} className="mt-2 h-20 object-contain rounded-lg" />}
                </div>
                <div>
                  <label className={labelClass}>Dashboard Banner</label>
                  <input type="file" accept="image/*" onChange={handleBannerUpload} className="text-sm" />
                  {bannerBase64 && <img src={bannerBase64} className="mt-2 h-20 object-cover rounded-lg w-full" />}
                </div>
              </div>
            </div>
          )}

          {/* ── مرحلہ 4: جائزہ ───────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <ClipboardList className="text-primary" size={24} /> Review & Confirm
              </h2>
              <div className="glass-card !bg-white/20 p-4 space-y-2 text-sm">
                <p><strong>School:</strong> {schoolName}</p>
                <p><strong>Type:</strong> {schoolType}</p>
                <p><strong>Level:</strong> {schoolLevel}</p>
                <p><strong>Staff entries:</strong> {staffList.length}</p>
                <p><strong>Logo:</strong> {logoBase64 ? "✓ Uploaded" : "Not provided"}</p>
                <p><strong>Banner:</strong> {bannerBase64 ? "✓ Uploaded" : "Not provided"}</p>
              </div>
              {error && <div className="text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}
              <button
                onClick={handleFinish}
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {saving ? "Saving..." : <><Check size={18} /> Complete Onboarding</>}
              </button>
            </div>
          )}

          {/* ── نیویگیشن بٹن ──────────────────────────────── */}
          {step < totalSteps && (
            <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
              <button onClick={prevStep} disabled={step === 1} className="glass-btn flex items-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
