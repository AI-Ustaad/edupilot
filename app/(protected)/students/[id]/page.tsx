"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2, AlertTriangle, User, Mail, Phone, MapPin, Calendar,
  Users, BookOpen, CreditCard, Activity, Bus, Home, FileText,
  Heart, Brain, Clock, Award, ClipboardCheck, Wallet, Shield,
} from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import Image from "next/image";
import { useStudent360, useStudentTimeline } from "@/hooks/useStudents";

const TABS = [
  { key: "overview", label: "Overview", icon: User },
  { key: "academic", label: "Academic", icon: BookOpen },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
  { key: "fees", label: "Fees", icon: Wallet },
  { key: "behavior", label: "Behavior", icon: Shield },
  { key: "timeline", label: "Timeline", icon: Clock },
  { key: "medical", label: "Medical", icon: Heart },
  { key: "transport", label: "Transport", icon: Bus },
  { key: "parents", label: "Parents", icon: Users },
  { key: "ai", label: "AI Analysis", icon: Brain },
] as const;

export default function Student360Page() {
  const params = useParams();
  const studentId = params?.id as string;
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { data, isLoading, isError, error } = useStudent360(studentId);
  const { data: timelineData } = useStudentTimeline(studentId);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
        <p className="text-gray-500 font-medium">Loading 360° Student Profile...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6 bg-red-50 rounded-2xl border border-red-200 max-w-2xl mx-auto mt-10">
        <AlertTriangle className="text-red-500 w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Failed to Load Profile</h2>
        <p className="text-gray-600 mt-2">{error?.message || "Student not found or you lack permissions."}</p>
      </div>
    );
  }

  // Extract data safely
  const student = data?.student || data;
  const attendance = data?.attendance || { present: 0, absent: 0, late: 0, percentage: 0 };
  const fees = data?.fees || { totalDue: 0, totalPaid: 0, outstanding: 0, records: [] };
  const marks = data?.marks || { exams: [], average: 0, trend: "stable" };
  const behavior = data?.behavior || { logs: [], incidents: 0 };
  const timeline = data?.timeline || timelineData || [];
  const status = student?.status || (student?.deleted ? "archived" : "active");

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    graduated: "bg-blue-100 text-blue-800 border-blue-200",
    transferred: "bg-gray-100 text-gray-800 border-gray-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
    archived: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <RequirePermission permissions={[PERMISSIONS.students.view]}>
      <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">

        {/* Header Card */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              {student?.photoBase64 ? (
                <Image src={student.photoBase64} alt={student.fullName || "Student"} width={128} height={128} className="w-28 h-28 rounded-full object-cover border-4 border-blue-50" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center border-4 border-blue-50">
                  <User className="text-gray-400" size={48} />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{student?.fullName || "N/A"}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status] || statusColors.active}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium mt-1">
                ID: {studentId} | Admission: {student?.admissionNumber || "N/A"}
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <span className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">Class: {student?.classGrade || "N/A"}</span>
                <span className="bg-purple-50 text-purple-600 border border-purple-100 px-3 py-1 rounded-full text-xs font-bold">Section: {student?.section || "N/A"}</span>
                <span className="bg-green-50 text-green-600 border border-green-100 px-3 py-1 rounded-full text-xs font-bold">Roll: {student?.rollNumber ?? "N/A"}</span>
                {attendance.percentage < 60 && (
                  <span className="bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <AlertTriangle size={12} /> Low Attendance
                  </span>
                )}
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <p className="text-2xl font-black text-green-700">{attendance.percentage}%</p>
                <p className="text-xs text-green-600 font-medium">Attendance</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-2xl font-black text-blue-700">{marks.average}%</p>
                <p className="text-xs text-blue-600 font-medium">Avg Marks</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <p className="text-2xl font-black text-orange-700">Rs {fees.outstanding.toLocaleString()}</p>
                <p className="text-xs text-orange-600 font-medium">Outstanding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 px-2 pt-2 gap-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-sm font-bold whitespace-nowrap transition ${activeTab === tab.key ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard title="Personal Information" icon={<User className="text-blue-600" size={18} />}>
                  <InfoRow label="Father Name" value={student?.fatherName} />
                  <InfoRow label="Date of Birth" value={student?.dateOfBirth || student?.dob} />
                  <InfoRow label="CNIC / B-Form" value={student?.cnic} />
                  <InfoRow label="Gender" value={student?.gender} />
                  <InfoRow label="Religion" value={student?.religion} />
                  <InfoRow label="Nationality" value={student?.nationality} />
                </InfoCard>
                <InfoCard title="Contact Information" icon={<Phone className="text-green-600" size={18} />}>
                  <InfoRow label="Email" value={student?.email} />
                  <InfoRow label="Phone" value={student?.phone} />
                  <InfoRow label="Address" value={student?.address} />
                  <InfoRow label="Guardian" value={student?.guardianName} />
                  <InfoRow label="Relation" value={student?.guardianRelation} />
                  <InfoRow label="Guardian Phone" value={student?.guardianPhone} />
                </InfoCard>
                <InfoCard title="Academic Info" icon={<BookOpen className="text-purple-600" size={18} />}>
                  <InfoRow label="Academic Year" value={student?.academicYear} />
                  <InfoRow label="Admission Method" value={student?.admissionMethod} />
                  <InfoRow label="House" value={student?.house} />
                  <InfoRow label="Previous Class" value={student?.previousClass ? `${student.previousClass}-${student.previousSection}` : undefined} />
                  <InfoRow label="Blood Group" value={student?.bloodGroup} />
                  <InfoRow label="Teacher Comment" value={student?.teacherComment} />
                </InfoCard>
              </div>
            )}

            {/* Academic Tab */}
            {activeTab === "academic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-3xl font-black text-blue-700">{marks.average}%</p>
                    <p className="text-sm text-blue-600 font-medium">Average Score</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                    <p className="text-3xl font-black text-green-700">{(marks.exams || []).length}</p>
                    <p className="text-sm text-green-600 font-medium">Exams Taken</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 text-center">
                    <p className="text-3xl font-black text-purple-700">{marks.trend}</p>
                    <p className="text-sm text-purple-600 font-medium">Trend</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-3 text-left font-bold text-gray-500 text-xs uppercase">Subject</th>
                        <th className="p-3 text-left font-bold text-gray-500 text-xs uppercase">Exam</th>
                        <th className="p-3 text-right font-bold text-gray-500 text-xs uppercase">Marks</th>
                        <th className="p-3 text-right font-bold text-gray-500 text-xs uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(marks.exams || []).length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">No exam records found</td></tr>
                      ) : (marks.exams || []).map((m: any, i: number) => (
                        <tr key={i}>
                          <td className="p-3 font-medium text-gray-800">{m.subjectName || m.subject || "N/A"}</td>
                          <td className="p-3 text-gray-600">{m.examName || m.examType || "N/A"}</td>
                          <td className="p-3 text-right font-bold text-gray-800">{m.obtainedMarks ?? "N/A"}</td>
                          <td className="p-3 text-right text-gray-500">{m.totalMarks ?? "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                    <p className="text-3xl font-black text-green-700">{attendance.present}</p>
                    <p className="text-sm text-green-600 font-medium">Present</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100 text-center">
                    <p className="text-3xl font-black text-red-700">{attendance.absent}</p>
                    <p className="text-sm text-red-600 font-medium">Absent</p>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100 text-center">
                    <p className="text-3xl font-black text-yellow-700">{attendance.late}</p>
                    <p className="text-sm text-yellow-600 font-medium">Late</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-3xl font-black text-blue-700">{attendance.percentage}%</p>
                    <p className="text-sm text-blue-600 font-medium">Rate</p>
                  </div>
                </div>
                {attendance.percentage < 60 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="text-red-500" size={20} />
                    <p className="text-red-800 font-medium">Warning: Attendance is below 60%. Student is at risk.</p>
                  </div>
                )}
              </div>
            )}

            {/* Fees Tab */}
            {activeTab === "fees" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-2xl font-black text-blue-700">Rs {fees.totalDue.toLocaleString()}</p>
                    <p className="text-sm text-blue-600 font-medium">Total Due</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
                    <p className="text-2xl font-black text-green-700">Rs {fees.totalPaid.toLocaleString()}</p>
                    <p className="text-sm text-green-600 font-medium">Total Paid</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 text-center">
                    <p className="text-2xl font-black text-orange-700">Rs {fees.outstanding.toLocaleString()}</p>
                    <p className="text-sm text-orange-600 font-medium">Outstanding</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-3 text-left font-bold text-gray-500 text-xs uppercase">Month</th>
                        <th className="p-3 text-right font-bold text-gray-500 text-xs uppercase">Amount</th>
                        <th className="p-3 text-right font-bold text-gray-500 text-xs uppercase">Paid</th>
                        <th className="p-3 text-center font-bold text-gray-500 text-xs uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(fees.records || []).length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-400">No fee records found</td></tr>
                      ) : (fees.records || []).map((f: any, i: number) => (
                        <tr key={i}>
                          <td className="p-3 font-medium text-gray-800">{f.month || f.feeMonth || "N/A"}</td>
                          <td className="p-3 text-right text-gray-600">Rs {(f.totalAmount || f.amount || 0).toLocaleString()}</td>
                          <td className="p-3 text-right text-green-600 font-medium">Rs {(f.paidAmount || 0).toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${(f.status || "").toLowerCase() === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                              {f.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Behavior Tab */}
            {activeTab === "behavior" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-50 rounded-xl px-4 py-2 border border-purple-100">
                    <p className="text-xl font-black text-purple-700">{behavior.incidents}</p>
                    <p className="text-xs text-purple-600 font-medium">Total Incidents</p>
                  </div>
                </div>
                {(behavior.logs || []).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Shield size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No behavior records found</p>
                  </div>
                ) : (behavior.logs || []).map((log: any, i: number) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800">{log.category || "Incident"}</p>
                        <p className="text-sm text-gray-500 mt-1">{log.description || log.details || "No details"}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.severity === "High" || log.severity === "high" ? "bg-red-100 text-red-700" : log.severity === "Medium" || log.severity === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {log.severity || "Low"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                {(timeline || []).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Clock size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No timeline events found</p>
                  </div>
                ) : (timeline || []).map((entry: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${entry.type === "admission" ? "bg-blue-500" : entry.type === "promotion" ? "bg-green-500" : entry.type === "graduation" ? "bg-purple-500" : "bg-gray-400"}`} />
                      {i < (timeline || []).length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-6">
                      <p className="font-bold text-gray-800">{entry.title}</p>
                      <p className="text-sm text-gray-500">{entry.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{entry.date ? new Date(entry.date).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Medical Tab */}
            {activeTab === "medical" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Medical Information" icon={<Heart className="text-red-600" size={18} />}>
                  <InfoRow label="Blood Group" value={student?.bloodGroup} />
                  <InfoRow label="Medical Conditions" value={student?.medicalConditions || "None reported"} />
                </InfoCard>
                <InfoCard title="Physical Info" icon={<Activity className="text-cyan-600" size={18} />}>
                  <InfoRow label="Date of Birth" value={student?.dateOfBirth || student?.dob} />
                  <InfoRow label="Gender" value={student?.gender} />
                  <InfoRow label="Religion" value={student?.religion} />
                </InfoCard>
              </div>
            )}

            {/* Transport Tab */}
            {activeTab === "transport" && (
              <div className="text-center py-12">
                <Bus size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">
                  {student?.transportRouteId ? `Route: ${student.transportRouteId}` : "No transport assigned"}
                </p>
              </div>
            )}

            {/* Parents Tab */}
            {activeTab === "parents" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard title="Guardian Information" icon={<Users className="text-green-600" size={18} />}>
                  <InfoRow label="Guardian Name" value={student?.guardianName} />
                  <InfoRow label="Relation" value={student?.guardianRelation} />
                  <InfoRow label="Phone" value={student?.guardianPhone} />
                </InfoCard>
                <InfoCard title="Family Information" icon={<Home className="text-blue-600" size={18} />}>
                  <InfoRow label="Father Name" value={student?.fatherName} />
                  <InfoRow label="Mother Name" value={student?.motherName} />
                  <InfoRow label="Phone" value={student?.phone} />
                </InfoCard>
              </div>
            )}

            {/* AI Analysis Tab */}
            {activeTab === "ai" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="text-blue-600" size={20} />
                    <h3 className="font-bold text-gray-900">AI Student Analysis</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <RiskBadge label="Attendance Risk" value={attendance.percentage < 60 ? "High" : attendance.percentage < 75 ? "Medium" : "Low"} />
                    <RiskBadge label="Performance" value={marks.average >= 70 ? "Good" : marks.average >= 50 ? "Average" : "At Risk"} />
                    <RiskBadge label="Fee Status" value={fees.outstanding > 0 ? "Pending" : "Clear"} />
                    <RiskBadge label="Behavior" value={behavior.incidents > 3 ? "Concern" : behavior.incidents > 0 ? "Watch" : "Good"} />
                    <RiskBadge label="Overall" value={attendance.percentage >= 75 && marks.average >= 60 && fees.outstanding === 0 ? "Healthy" : "Needs Attention"} />
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3">Suggested Actions</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {attendance.percentage < 60 && <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-red-500 mt-0.5" /> Schedule parent meeting regarding attendance</li>}
                    {marks.average < 50 && <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-orange-500 mt-0.5" /> Consider remedial classes or tutoring</li>}
                    {fees.outstanding > 0 && <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-yellow-500 mt-0.5" /> Send fee reminder to parents</li>}
                    {behavior.incidents > 3 && <li className="flex items-start gap-2"><AlertTriangle size={14} className="text-purple-500 mt-0.5" /> Review behavior pattern with counselor</li>}
                    {attendance.percentage >= 75 && marks.average >= 60 && fees.outstanding === 0 && behavior.incidents <= 1 && (
                      <li className="flex items-start gap-2"><Award size={14} className="text-green-500 mt-0.5" /> Student is performing well. No actions needed.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequirePermission>
  );
}

// Helper Components
function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">{icon} {title}</h3>
      <div className="space-y-3 text-sm">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-900 font-bold text-right">{value || "N/A"}</span>
    </div>
  );
}

function RiskBadge({ label, value }: { label: string; value: string }) {
  const color = value === "High" || value === "At Risk" || value === "Concern" || value === "Pending"
    ? "bg-red-100 text-red-800"
    : value === "Medium" || value === "Average" || value === "Watch" || value === "Needs Attention"
    ? "bg-yellow-100 text-yellow-800"
    : "bg-green-100 text-green-800";
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}
