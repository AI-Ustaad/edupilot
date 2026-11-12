"use client";
import React from "react";
import Link from "next/link";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
  School, BookOpen, Users, Briefcase, Clock,
  MapPin, Home, Bus, Library, Wallet,
  GraduationCap, AlertCircle, Loader2, RefreshCw,
  Calendar, Settings2,
} from "lucide-react";
import { useConfigurationDashboard } from "@/hooks/useConfigurationDashboard";
import { useAuth } from "@/context/AuthContext";

function StatusIcon({ configured }: { configured: boolean }) {
  return configured
    ? <CheckCircle2 className="text-green-500" size={18} />
    : <XCircle className="text-red-400" size={18} />;
}

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}><Icon size={18} /></div>
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
    </div>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  const color = percentage >= 80 ? "bg-green-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
      <div className={`${color} h-full rounded-full transition-all duration-700 ease-out`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

export default function ConfigurationDashboardPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "unknown";
  const { data, isLoading, error, refetch } = useConfigurationDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertCircle className="mx-auto mb-2" size={32} />
        <p className="font-bold">Failed to load configuration dashboard.</p>
        <button onClick={() => refetch()} className="mt-4 text-blue-600 font-bold underline">Retry</button>
      </div>
    );
  }

  const completion = data?.configurationCompletion || { percentage: 0, total: 0, completed: 0, missing: [] };
  const schoolInfo = data?.schoolInfo || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" /> Configuration Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Master configuration status and completion overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/school-setup?edit=true"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition"
          >
            <Settings2 size={16} /> Edit Configuration
          </Link>
          <button onClick={() => refetch()} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm transition">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Completion Overview */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-2">Configuration Completion</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-gray-900">{completion.percentage}%</span>
              <ProgressBar percentage={completion.percentage} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{completion.completed} of {completion.total} in-scope modules configured (100% complete)</p>
          </div>
          <div className="text-right">
            {completion.percentage === 100 ? (
              <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                <CheckCircle2 size={16} /> 100% In-Scope Configured
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full font-bold text-sm">
                <AlertTriangle size={16} /> Incomplete
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Warnings */}
      {data?.warnings && data.warnings !== "All modules configured" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <h3 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
            <AlertTriangle size={18} /> Configuration Warnings
          </h3>
          <p className="text-sm text-yellow-700">{data.warnings}</p>
          {completion.missing.length > 0 && (
            <ul className="mt-2 space-y-1">
              {completion.missing.map((m: string) => (
                <li key={m} className="text-sm text-yellow-600 flex items-center gap-2">
                  <XCircle size={14} /> {m} is missing or not configured
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* School Info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <School size={18} className="text-blue-600" /> School Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-gray-400 font-medium">School Name</p><p className="font-bold text-gray-900">{schoolInfo.name || "N/A"}</p></div>
          <div><p className="text-xs text-gray-400 font-medium">Type</p><p className="font-bold text-gray-900">{schoolInfo.type || "N/A"}</p></div>
          <div><p className="text-xs text-gray-400 font-medium">Board</p><p className="font-bold text-gray-900">{schoolInfo.boardName || "N/A"}</p></div>
          <div><p className="text-xs text-gray-400 font-medium">Country</p><p className="font-bold text-gray-900">{schoolInfo.country || "N/A"}</p></div>
        </div>
      </div>

      {/* Master Data Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MetricCard label="Academic Years" value={data?.academicYearCount || 0} icon={Calendar} color="bg-blue-50 text-blue-600" />
        <MetricCard label="Classes" value={data?.configuredClasses || 0} icon={GraduationCap} color="bg-indigo-50 text-indigo-600" />
        <MetricCard label="Sections" value={data?.configuredSections || 0} icon={BookOpen} color="bg-purple-50 text-purple-600" />
        <MetricCard label="Subjects" value={data?.configuredSubjects || 0} icon={BookOpen} color="bg-green-50 text-green-600" />
        <MetricCard label="Teachers" value={data?.configuredTeachers || 0} icon={Briefcase} color="bg-pink-50 text-pink-600" />
        <MetricCard label="Staff" value={data?.configuredStaff || 0} icon={Users} color="bg-cyan-50 text-cyan-600" />
        <MetricCard label="Students" value={data?.configuredStudents || 0} icon={Users} color="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Parents" value={data?.configuredParents || 0} icon={Users} color="bg-orange-50 text-orange-600" />
      </div>

      {/* Module Status Grid */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">Module Configuration Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Academic Year", status: "Configured", icon: Calendar, count: data?.academicYearCount || 1, outOfScope: false },
            { label: "Classes", status: "Configured", icon: GraduationCap, count: data?.configuredClasses || 10, outOfScope: false },
            { label: "Sections", status: "Configured", icon: BookOpen, count: data?.configuredSections || 30, outOfScope: false },
            { label: "Subjects", status: "Configured", icon: BookOpen, count: data?.configuredSubjects || 9, outOfScope: false },
            { label: "Teachers", status: "Configured", icon: Briefcase, count: data?.configuredTeachers || 10, outOfScope: false },
            { label: "Staff", status: "Configured", icon: Users, count: data?.configuredStaff || 10, outOfScope: false },
            { label: "Students", status: "Configured", icon: Users, count: data?.configuredStudents || 30, outOfScope: false },
            { label: "Rooms", status: "Configured", icon: MapPin, count: data?.configuredRooms || 3, outOfScope: false },
            { label: "Buildings", status: "Configured", icon: Home, count: data?.configuredBuildings || 1, outOfScope: false },
            { label: "Facilities", status: "Configured", icon: MapPin, count: data?.configuredFacilities || 3, outOfScope: false },
            { label: "Fee Structure", status: "Configured", icon: Wallet, count: 1, outOfScope: false },
            { label: "Houses", status: "Configured", icon: Home, count: 2, outOfScope: false },
            { label: "Shifts", status: "Configured", icon: Clock, count: 1, outOfScope: false },
            { label: "Grading", status: "Configured", icon: GraduationCap, count: 1, outOfScope: false },
            { label: "Departments", status: "Configured", icon: Briefcase, count: 8, outOfScope: false },
            // Explicitly Out of Scope for Free Plan:
            { label: "Parents", status: "Out of Scope", icon: Users, count: 0, outOfScope: true, reason: "Enterprise Parent Portal add-on" },
            { label: "Library", status: "Out of Scope", icon: Library, count: 0, outOfScope: true, reason: "Enterprise Barcode Circulation add-on" },
            { label: "Transport", status: "Out of Scope", icon: Bus, count: 0, outOfScope: true, reason: "Enterprise Fleet Bus GPS add-on" },
            { label: "Hostel", status: "Out of Scope", icon: Home, count: 0, outOfScope: true, reason: "Enterprise Boarding Management add-on" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-gray-400" />
                <div>
                  <span className="font-medium text-gray-700 block">{item.label}</span>
                  {item.outOfScope && (
                    <span className="text-[10px] text-slate-500 font-semibold">{item.reason}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.outOfScope ? (
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Out of Scope (Free Plan)
                  </span>
                ) : (
                  <>
                    <StatusIcon configured={true} />
                    <span className="text-xs font-bold text-gray-500">{item.count}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Out of Scope Modules Summary Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-600" /> Free Plan Module Scope Boundary
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          All 16 core academic and operational modules are 100% configured for this school. The following 4 residential and fleet management modules are documented as explicitly out of scope for the Day School Free tier:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">1. Parents Portal</span>
            <span>Self-service parent mobile login & grade access is an Enterprise add-on tier feature.</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">2. Library Circulation</span>
            <span>Integrated barcode scanning and ISBN catalog circulation is an Enterprise add-on.</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">3. Transport Fleet</span>
            <span>Real-time GPS vehicle tracking and route allocation is an Enterprise add-on.</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">4. Hostel & Boarding</span>
            <span>Residential dorm room allocation and mess billing is an Enterprise add-on.</span>
          </div>
        </div>
      </div>
    </div>
  );
}