"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";

export default function Attendance() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"students" | "staff">("students");
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setFullYear(2026); 
    return today.toISOString().split("T")[0];
  });
  
  const [selectedClass, setSelectedClass] = useState("");
  const [staffCategory, setStaffCategory] = useState("All");

  const [attendanceType, setAttendanceType] = useState("Daily");
  const [attendancePeriod, setAttendancePeriod] = useState("1st Term");
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: string }>({});

  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const sbaTerms = ["1st Term", "2nd Term", "3rd Term"];
  const pectaYears = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) router.push("/login");
      else {
        setUser(currentUser);
        await fetchData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async (uid: string) => {
    try {
      const studentSnap = await getDocs(collection(db, "users", uid, "students"));
      const sData: any[] = [];
      studentSnap.forEach(doc => sData.push({ id: doc.id, ...doc.data() }));
      setStudents(sData);

      const staffSnap = await getDocs(collection(db, "users", uid, "staff"));
      const stData: any[] = [];
      staffSnap.forEach(doc => stData.push({ id: doc.id, ...doc.data() }));
      setStaff(stData);
    } catch (error) { console.error("Fetch Error:", error); } finally { setLoading(false); }
  };

  const handleAttendanceTypeChange = (e: any) => {
    const type = e.target.value;
    setAttendanceType(type);
    if (type === "Daily" || type === "SBA") setAttendancePeriod("1st Term");
    else if (type === "Monthly Test") setAttendancePeriod("January");
    else if (type === "PECTA") setAttendancePeriod("2026");
  };

  const markStatus = (id: string, status: string) => setAttendanceData(prev => ({ ...prev, [id]: status }));
  const markAll = (list: any[], status: string) => {
    const newData = { ...attendanceData };
    list.forEach(person => { newData[person.id] = status; });
    setAttendanceData(newData);
  };

  const saveAttendance = async () => {
    if (!user) return;
    setIsSaving(true);
    const dbTermKey = `${attendanceType}_${attendancePeriod}`;

    try {
      if (activeTab === "students") {
        for (const s of displayStudents) {
          if (attendanceData[s.id]) {
            await setDoc(doc(db, "users", user.uid, "students", s.id, "attendance", selectedDate), {
              date: selectedDate, status: attendanceData[s.id], term: dbTermKey, timestamp: new Date()
            });
          }
        }
      } else {
        for (const st of displayStaff) {
          if (attendanceData[st.id]) {
            await setDoc(doc(db, "users", user.uid, "staff", st.id, "attendance", selectedDate), {
              date: selectedDate, status: attendanceData[st.id], category: st.designation, timestamp: new Date()
            });
          }
        }
      }
      alert("Attendance Saved Successfully!");
    } catch (error: any) { alert("Error Saving: " + error.message); } finally { setIsSaving(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // 🔥 Smart Class Extractor (Combines Class + Section)
  const uniqueClasses = Array.from(new Set(students.map(s => {
    if (s.studentClass && s.section) return `${s.studentClass} - ${s.section}`;
    return s.studentClass || s.classSection || ""; // Fallback for old data
  }).filter(Boolean)));

  const displayStudents = students.filter(s => {
    if (selectedClass === "") return true;
    const combined = s.studentClass && s.section ? `${s.studentClass} - ${s.section}` : s.studentClass || s.classSection;
    return combined === selectedClass;
  });

  const displayStaff = staff.filter(s => staffCategory === "All" || s.designation.includes(staffCategory));

  if (loading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="edu-spinner"></div><h2 style={{ color: "white", fontSize: "32px", fontWeight: "900", letterSpacing: "2px", margin: "20px 0 10px 0" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h2><p className="edu-pulse-text" style={{ color: "#94a3b8" }}>Loading Attendance Module...</p>
        <style>{`.edu-spinner { width: 50px; height: 50px; border: 4px solid rgba(62, 162, 224, 0.1); border-left-color: #3ea2e0; border-radius: 50%; animation: edu-spin 1s linear infinite; } @keyframes edu-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .edu-pulse-text { animation: edu-pulse 1.5s ease-in-out infinite; } @keyframes edu-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* 🌟 MODERN LEFT SIDEBAR */}
      <div style={{ width: "260px", background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", height: "100vh", zIndex: 100, boxShadow: "4px 0 10px rgba(0,0,0,0.02)" }}>
        <div style={{ padding: "0 20px", marginBottom: "30px" }}><h1 style={{ margin: 0, fontSize: "24px", color: "#0f172a", fontWeight: "900" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h1><p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#10b981", fontWeight: "bold", background: "#d1fae5", padding: "3px 10px", borderRadius: "10px", display: "inline-block", letterSpacing: "1px" }}>ACTIVE WORKSPACE</p></div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 15px" }}>
          <div style={navSectionLabel}>OVERVIEW</div>
          <div onClick={() => router.push("/dashboard")} className="nav-item" style={navItem}><span style={iconPlaceholder}>📊</span> Dashboard</div>
          <div style={navSectionLabel}>ACADEMICS</div>
          <div onClick={() => router.push("/students")} className="nav-item" style={navItem}><span style={iconPlaceholder}>👨‍🎓</span> Students Profile</div>
          <div style={activeNavItem}><span style={iconPlaceholder}>⏱️</span> Daily Attendance</div>
          <div onClick={() => router.push("/result")} className="nav-item" style={navItem}><span style={iconPlaceholder}>📄</span> Term Results</div>
          <div style={navSectionLabel}>FINANCE</div>
          <div onClick={() => router.push("/fees")} className="nav-item" style={navItem}><span style={iconPlaceholder}>💰</span> Fee Management</div>
          <div style={navSectionLabel}>STAFF & OPS</div>
          <div onClick={() => router.push("/staff")} className="nav-item" style={navItem}><span style={iconPlaceholder}>🧑‍🏫</span> HR & Teachers</div>
          <div style={navSectionLabel}>SYSTEM</div>
          <div onClick={() => router.push("/settings")} className="nav-item" style={navItem}><span style={iconPlaceholder}>⚙️</span> School Settings</div>
        </div>
        <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", marginTop: "auto", background: "#f8fafc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>{user?.email?.charAt(0).toUpperCase() || "A"}</div><div><p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>System Admin</p><p onClick={handleLogout} className="logout-btn" style={{ margin: 0, fontSize: "12px", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Logout Securely</p></div></div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT AREA */}
      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", background: "white", borderRadius: "24px", padding: "30px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px", paddingBottom: "20px", borderBottom: "2px solid #f1f5f9" }}>
            <div>
              <h2 style={{ margin: "0 0 15px 0", color: "#0f172a", fontSize: "28px" }}>Daily Register</h2>
              <div style={{ display: "flex", gap: "10px", background: "#f1f5f9", padding: "5px", borderRadius: "12px", width: "fit-content" }}>
                <button onClick={() => setActiveTab("students")} style={activeTab === "students" ? activeTabBtn : inactiveTabBtn}>👨‍🎓 Student Attendance</button>
                <button onClick={() => setActiveTab("staff")} style={activeTab === "staff" ? activeTabBtn : inactiveTabBtn}>🧑‍🏫 Staff & HR Attendance</button>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <label style={labelStyle}>Attendance Date</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{...inputStyle, width: "180px", fontWeight: "bold", color: "#0f172a"}} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "15px", marginBottom: "20px", background: "#f8fafc", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0", alignItems: "center" }}>
            {activeTab === "students" ? (
              <>
                <div style={{ flex: 1.5 }}><label style={labelStyle}>Select Class & Section</label><select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={inputStyle}><option value="">All Classes</option>{uniqueClasses.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}</select></div>
                <div style={{ flex: 1.5 }}><label style={labelStyle}>Attendance Type</label><select value={attendanceType} onChange={handleAttendanceTypeChange} style={inputStyle}><option value="Daily">Daily Regular</option><option value="Monthly Test">Monthly Test</option><option value="SBA">SBA (Term Exams)</option><option value="PECTA">PECTA (Annual)</option></select></div>
                <div style={{ flex: 1.5 }}><label style={labelStyle}>Select Period</label><select value={attendancePeriod} onChange={(e) => setAttendancePeriod(e.target.value)} style={{...inputStyle, background: "#eff6ff", borderColor: "#bfdbfe", color: "#1e3a8a", fontWeight: "bold"}}>{(attendanceType === "Daily" || attendanceType === "SBA") && sbaTerms.map(t => <option key={t} value={t}>{t}</option>)}{attendanceType === "Monthly Test" && monthsList.map(m => <option key={m} value={m}>{m}</option>)}{attendanceType === "PECTA" && pectaYears.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                <div style={{ display: "flex", gap: "5px", alignItems: "flex-end" }}><button onClick={() => markAll(displayStudents, "Present")} style={{...bulkBtn, background: "#d1fae5", color: "#059669", border: "1px solid #34d399"}}>Mark All P</button><button onClick={() => markAll(displayStudents, "Absent")} style={{...bulkBtn, background: "#fee2e2", color: "#dc2626", border: "1px solid #f87171"}}>Mark All A</button></div>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}><label style={labelStyle}>Staff Department</label><select value={staffCategory} onChange={(e) => setStaffCategory(e.target.value)} style={inputStyle}><option value="All">All Staff</option><option value="Teacher">Teachers</option><option value="Principal">Administration</option><option value="Accountant">Accounts</option><option value="Clerk">Clerical / Office</option><option value="Support Staff">Support Staff</option></select></div>
                <div style={{ display: "flex", gap: "5px", alignItems: "flex-end" }}><button onClick={() => markAll(displayStaff, "Present")} style={{...bulkBtn, background: "#d1fae5", color: "#059669", border: "1px solid #34d399"}}>Mark All Present</button></div>
              </>
            )}
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead><tr style={{ background: "#0f172a", color: "white" }}><th style={{ padding: "12px 15px" }}>{activeTab === "students" ? "Student Name & Father Name" : "Staff Name"}</th><th style={{ padding: "12px 15px" }}>{activeTab === "students" ? "Class, Section & Roll No" : "Designation"}</th><th style={{ padding: "12px 15px", textAlign: "center" }}>Mark Attendance</th></tr></thead>
              <tbody>
                {(activeTab === "students" ? displayStudents : displayStaff).length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>No records found.</td></tr>
                ) : (
                  (activeTab === "students" ? displayStudents : displayStaff).map((person) => {
                    const status = attendanceData[person.id];
                    return (
                      <tr key={person.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        {/* 🔥 NEW: Explicitly rendering Father's Name directly under the student's name! */}
                        <td style={{ padding: "12px 15px", color: "#1e293b" }}>
                          <strong style={{ fontSize: "15px" }}>{person.fullName || person.firstName}</strong> <br/>
                          {activeTab === "students" && <span style={{ fontSize: "12px", color: "#64748b" }}>S/O {person.fatherName || "N/A"}</span>}
                        </td>
                        <td style={{ padding: "12px 15px", color: "#64748b", fontWeight: "bold" }}>
                          {activeTab === "students" ? `${person.studentClass || person.classSection || "N/A"} (${person.section || "N/A"}) - Adm: ${person.admissionNo}` : person.designation}
                        </td>
                        <td style={{ padding: "12px 15px", textAlign: "center" }}>
                          <div style={{ display: "inline-flex", background: "#f1f5f9", borderRadius: "8px", padding: "4px", gap: "4px" }}>
                            <button onClick={() => markStatus(person.id, "Present")} style={status === "Present" ? activePBtn : defaultPBtn}>P</button>
                            <button onClick={() => markStatus(person.id, "Absent")} style={status === "Absent" ? activeABtn : defaultABtn}>A</button>
                            <button onClick={() => markStatus(person.id, "Late")} style={status === "Late" ? activeLBtn : defaultLBtn}>L</button>
                            <button onClick={() => markStatus(person.id, "Leave")} style={status === "Leave" ? activeLvBtn : defaultLvBtn}>Lv</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <button onClick={saveAttendance} disabled={isSaving || Object.keys(attendanceData).length === 0} style={{ width: "100%", background: "#3b82f6", color: "white", padding: "16px", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", marginTop: "30px", cursor: (isSaving || Object.keys(attendanceData).length === 0) ? "not-allowed" : "pointer", opacity: (isSaving || Object.keys(attendanceData).length === 0) ? 0.6 : 1, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)", transition: "all 0.2s" }}>
            {isSaving ? "Saving Records..." : "💾 Save Daily Register"}
          </button>
        </div>
      </div>

      <style>{`
        .nav-item { transition: all 0.2s; border-left: 3px solid transparent; }
        .nav-item:hover { background: #f8fafc; color: #3ea2e0 !important; cursor: pointer; border-left: 3px solid #3ea2e0; }
        .logout-btn:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

const navSectionLabel = { fontSize: "11px", fontWeight: "bold", color: "#94a3b8", marginTop: "25px", marginBottom: "10px", paddingLeft: "10px", letterSpacing: "1px" };
const navItem = { display: "flex", alignItems: "center", padding: "12px 10px", borderRadius: "0 8px 8px 0", color: "#475569", fontSize: "14px", fontWeight: "600", marginBottom: "2px" };
const activeNavItem = { ...navItem, background: "#eff6ff", color: "#3ea2e0", borderLeft: "3px solid #3ea2e0" };
const iconPlaceholder = { width: "24px", textAlign: "center" as const, marginRight: "12px", fontSize: "18px" };
const inputStyle = { padding: "10px 15px", width: "100%", boxSizing: "border-box" as const, border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", background: "white" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "6px" };
const activeTabBtn = { background: "white", color: "#0f172a", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" };
const inactiveTabBtn = { background: "transparent", color: "#64748b", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" };
const bulkBtn = { padding: "8px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", height: "40px" };
const baseBtn = { width: "40px", height: "35px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" };
const defaultPBtn = { ...baseBtn, background: "white", color: "#64748b" };
const activePBtn = { ...baseBtn, background: "#10b981", color: "white", boxShadow: "0 4px 6px rgba(16, 185, 129, 0.3)" };
const defaultABtn = { ...baseBtn, background: "white", color: "#64748b" };
const activeABtn = { ...baseBtn, background: "#ef4444", color: "white", boxShadow: "0 4px 6px rgba(239, 68, 68, 0.3)" };
const defaultLBtn = { ...baseBtn, background: "white", color: "#64748b" };
const activeLBtn = { ...baseBtn, background: "#f59e0b", color: "white", boxShadow: "0 4px 6px rgba(245, 158, 11, 0.3)" };
const defaultLvBtn = { ...baseBtn, background: "white", color: "#64748b" };
const activeLvBtn = { ...baseBtn, background: "#6366f1", color: "white", boxShadow: "0 4px 6px rgba(99, 102, 241, 0.3)" };