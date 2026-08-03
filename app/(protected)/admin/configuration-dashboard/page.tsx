"use client";
import React from "react";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle,
  School, BookOpen, Users, Briefcase, Clock,
  MapPin, Home, Bus, Library, Wallet,
  GraduationCap, AlertCircle, Loader2, RefreshCw,
  Calendar,
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
        <button onClick={() => refetch()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm">
          <RefreshCw size={16} /> Refresh
        </button>
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
            <p className="text-sm text-gray-500 mt-2">{completion.completed} of {completion.total} modules configured</p>
          </div>
          <div className="text-right">
            {completion.percentage === 100 ? (
              <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                <CheckCircle2 size={16} /> Fully Configured
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
            { label: "Academic Year", status: data?.academicYearCount > 0 ? "Configured" : "Not Configured", icon: Calendar, count: data?.academicYearCount },
            { label: "Classes", status: data?.configuredClasses > 0 ? "Configured" : "Not Configured", icon: GraduationCap, count: data?.configuredClasses },
            { label: "Sections", status: data?.configuredSections > 0 ? "Configured" : "Not Configured", icon: BookOpen, count: data?.configuredSections },
            { label: "Subjects", status: data?.configuredSubjects > 0 ? "Configured" : "Not Configured", icon: BookOpen, count: data?.configuredSubjects },
            { label: "Teachers", status: data?.configuredTeachers > 0 ? "Configured" : "Not Configured", icon: Briefcase, count: data?.configuredTeachers },
            { label: "Staff", status: data?.configuredStaff > 0 ? "Configured" : "Not Configured", icon: Users, count: data?.configuredStaff },
            { label: "Students", status: data?.configuredStudents > 0 ? "Configured" : "Not Configured", icon: Users, count: data?.configuredStudents },
            { label: "Parents", status: data?.configuredParents > 0 ? "Configured" : "Not Configured", icon: Users, count: data?.configuredParents },
            { label: "Rooms", status: data?.configuredRooms > 0 ? "Configured" : "Not Configured", icon: MapPin, count: data?.configuredRooms },
            { label: "Buildings", status: data?.configuredBuildings > 0 ? "Configured" : "Not Configured", icon: Home, count: data?.configuredBuildings },
            { label: "Facilities", status: data?.configuredFacilities > 0 ? "Configured" : "Not Configured", icon: MapPin, count: data?.configuredFacilities },
            { label: "Library", status: data?.libraryStatus || "Not Configured", icon: Library, count: data?.libraryStatus === "Configured" ? 1 : 0 },
            { label: "Transport", status: data?.transportStatus || "Not Configured", icon: Bus, count: data?.transportStatus === "Configured" ? 1 : 0 },
            { label: "Hostel", status: data?.hostelStatus || "Not Configured", icon: Home, count: data?.hostelStatus === "Configured" ? 1 : 0 },
            { label: "Fee Structure", status: data?.feeConfiguration || "Not Configured", icon: Wallet, count: data?.feeConfiguration === "Configured" ? 1 : 0 },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-gray-400" />
                <span className="font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon configured={item.status === "Configured"} />
                <span className="text-xs font-bold text-gray-500">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}