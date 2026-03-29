"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";

export default function ResultCards() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStudentId = searchParams.get("studentId");

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  
  // 🌟 Dynamic Exam Selection States
  const [selectedStudentId, setSelectedStudentId] = useState(urlStudentId || "");
  const [examType, setExamType] = useState("SBA");
  const [examSubType, setExamSubType] = useState("1st Term");

  // Live Data States
  const [marks, setMarks] = useState({ math: "", english: "", urdu: "", science: "", history: "", islamiyat: "" });
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0 });

  // Dropdown Options
  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const sbaTerms = ["1st Term", "2nd Term", "3rd Term"];
  const pectaYears = ["2024", "2025", "2026", "2027", "2028", "2029", "2030"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) router.push("/login");
      else {
        setUser(currentUser);
        await fetchInitialData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchInitialData = async (uid: string) => {
    try {
      const settingsSnap = await getDoc(doc(db, "users", uid, "settings", "branding"));
      if (settingsSnap.exists()) setSchoolSettings(settingsSnap.data());

      const studentSnap = await getDocs(collection(db, "users", uid, "students"));
      const sData: any[] = [];
      studentSnap.forEach(doc => sData.push({ id: doc.id, ...doc.data() }));
      setStudents(sData);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Exam Type Change to auto-select the correct Sub-Type
  const handleExamTypeChange = (e: any) => {
    const type = e.target.value;
    setExamType(type);
    if (type === "SBA") setExamSubType("1st Term");
    else if (type === "Monthly Test") setExamSubType("January");
    else if (type === "PECTA") setExamSubType("2026");
  };

  // Create a unique database key based on both selections (e.g., "SBA_1st Term" or "Monthly Test_April")
  const dbTermKey = `${examType}_${examSubType}`;

  useEffect(() => {
    if (user && selectedStudentId && examType && examSubType) {
      loadTermData(user.uid, selectedStudentId, dbTermKey);
    }
  }, [selectedStudentId, examType, examSubType, user]);

  const loadTermData = async (uid: string, studentId: string, termKey: string) => {
    try {
      // Fetch Marks
      const markSnap = await getDoc(doc(db, "users", uid, "students", studentId, "marks", termKey));
      if (markSnap.exists()) {
        setMarks(markSnap.data().marks);
      } else {
        setMarks({ math: "", english: "", urdu: "", science: "", history: "", islamiyat: "" });
      }

      // Fetch & Calculate Synchronized Attendance AUTOMATICALLY!
      const attSnap = await getDocs(collection(db, "users", uid, "students", studentId, "attendance"));
      let totalDays = 0;
      let presentDays = 0;
      
      attSnap.forEach(doc => {
        const data = doc.data();
        if (data.term === termKey) { // Syncs perfectly with Attendance Module
          totalDays++;
          if (data.status === "Present" || data.status === "Late") presentDays++;
        }
      });
      setAttendanceStats({ total: totalDays, present: presentDays });

    } catch (error) {
      console.error("Error loading term data:", error);
    }
  };

  const handleMarkChange = (subject: string, value: string) => {
    setMarks(prev => ({ ...prev, [subject]: value }));
  };

  const saveMarks = async () => {
    if (!user || !selectedStudentId) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid, "students", selectedStudentId, "marks", dbTermKey), {
        examType: examType,
        examSubType: examSubType,
        termKey: dbTermKey,
        marks: marks,
        updatedAt: new Date()
      });
      alert("Marks saved successfully!");
    } catch (error: any) {
      alert("Error saving marks: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Calculations for Grade and Remarks
  const subjects = Object.entries(marks);
  const totalObtained = subjects.reduce((sum, [_, val]) => sum + (Number(val) || 0), 0);
  const maxMarks = subjects.length * 100;
  const percentage = maxMarks > 0 ? ((totalObtained / maxMarks) * 100).toFixed(1) : "0.0";
  
  let grade = "F";
  let aiRemark = "Needs serious improvement.";
  if (Number(percentage) >= 80) { grade = "A+"; aiRemark = "Excellent performance! Keep up the brilliant work."; }
  else if (Number(percentage) >= 70) { grade = "A"; aiRemark = "Very good effort. Has potential to reach the top."; }
  else if (Number(percentage) >= 60) { grade = "B"; aiRemark = "Good, but requires more focus on weaker subjects."; }
  else if (Number(percentage) >= 50) { grade = "C"; aiRemark = "Average performance. Needs dedicated study time at home."; }

  if (loading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="edu-spinner"></div><h2 style={{ color: "white", fontSize: "32px", fontWeight: "900", letterSpacing: "2px", margin: "20px 0 10px 0" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h2><p className="edu-pulse-text" style={{ color: "#94a3b8" }}>Loading Academics Module...</p>
        <style>{`.edu-spinner { width: 50px; height: 50px; border: 4px solid rgba(62, 162, 224, 0.1); border-left-color: #3ea2e0; border-radius: 50%; animation: edu-spin 1s linear infinite; } @keyframes edu-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .edu-pulse-text { animation: edu-pulse 1.5s ease-in-out infinite; } @keyframes edu-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* 🔥 ADVANCED 1-PAGE PRINT CSS */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 0 !important; }
          .print-grid { display: block !important; gap: 0 !important; margin: 0 !important; }
          /* Scales down to 88% to guarantee it fits on 1 page without clipping */
          .print-only { 
            box-shadow: none !important; border: none !important; width: 100% !important; 
            max-width: 100% !important; margin: 0 auto !important; padding: 0 !important; 
            min-height: auto !important; transform: scale(0.88); transform-origin: top center; 
          }
        }
        .nav-item { transition: all 0.2s; border-left: 3px solid transparent; }
        .nav-item:hover { background: #f8fafc; color: #3ea2e0 !important; cursor: pointer; border-left: 3px solid #3ea2e0; }
      `}</style>

      {/* 🌟 MODERN LEFT SIDEBAR */}
      <div className="no-print" style={{ width: "260px", background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", height: "100vh", zIndex: 100, boxShadow: "4px 0 10px rgba(0,0,0,0.02)" }}>
        <div style={{ padding: "0 20px", marginBottom: "30px" }}><h1 style={{ margin: 0, fontSize: "24px", color: "#0f172a", fontWeight: "900" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h1><p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#10b981", fontWeight: "bold", background: "#d1fae5", padding: "3px 10px", borderRadius: "10px", display: "inline-block", letterSpacing: "1px" }}>ACTIVE WORKSPACE</p></div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 15px" }}>
          <div style={navSectionLabel}>OVERVIEW</div>
          <div onClick={() => router.push("/dashboard")} className="nav-item" style={navItem}><span style={iconPlaceholder}>📊</span> Dashboard</div>
          <div style={navSectionLabel}>ACADEMICS</div>
          <div onClick={() => router.push("/students")} className="nav-item" style={navItem}><span style={iconPlaceholder}>👨‍🎓</span> Students Profile</div>
          <div onClick={() => router.push("/attendance")} className="nav-item" style={navItem}><span style={iconPlaceholder}>⏱️</span> Daily Attendance</div>
          <div style={activeNavItem}><span style={iconPlaceholder}>📄</span> Term Results</div>
          <div style={navSectionLabel}>FINANCE</div>
          <div onClick={() => router.push("/fees")} className="nav-item" style={navItem}><span style={iconPlaceholder}>💰</span> Fee Management</div>
          <div style={navSectionLabel}>STAFF & OPS</div>
          <div onClick={() => router.push("/staff")} className="nav-item" style={navItem}><span style={iconPlaceholder}>🧑‍🏫</span> HR & Teachers</div>
          <div style={navSectionLabel}>SYSTEM</div>
          <div onClick={() => router.push("/settings")} className="nav-item" style={navItem}><span style={iconPlaceholder}>⚙️</span> School Settings</div>
        </div>
        <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", marginTop: "auto", background: "#f8fafc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>{user?.email?.charAt(0).toUpperCase() || "A"}</div><div><p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>System Admin</p><p onClick={handleLogout} style={{ margin: 0, fontSize: "12px", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Logout Securely</p></div></div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT AREA */}
      <div className="main-content print-grid" style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        
        {/* 🌟 TOP CONTROLS (Smart Dropdowns) */}
        <div className="no-print" style={{ background: "white", padding: "25px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "30px", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr auto", gap: "20px", alignItems: "end" }}>
          
          <div>
            <label style={labelStyle}>Select Student</label>
            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} style={inputStyle}>
              <option value="">-- Search & Choose Student --</option>
              {/* 🔥 NEW: Explicitly rendering Father Name and Section */}
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName ? `${s.firstName} ${s.lastName || ""}`.trim() : s.fullName} S/O {s.fatherName || "N/A"} - {s.studentClass || s.classSection || "N/A"} ({s.section || "N/A"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Exam Type</label>
            <select value={examType} onChange={handleExamTypeChange} style={inputStyle}>
              <option value="SBA">SBA (Terms)</option>
              <option value="Monthly Test">Monthly Test</option>
              <option value="PECTA">PECTA (Annual)</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>{examType === "PECTA" ? "Select Year" : examType === "Monthly Test" ? "Select Month" : "Select Term"}</label>
            <select value={examSubType} onChange={(e) => setExamSubType(e.target.value)} style={{...inputStyle, background: "#eff6ff", borderColor: "#bfdbfe", color: "#1e3a8a", fontWeight: "bold"}}>
              {examType === "SBA" && sbaTerms.map(t => <option key={t} value={t}>{t}</option>)}
              {examType === "Monthly Test" && monthsList.map(m => <option key={m} value={m}>{m}</option>)}
              {examType === "PECTA" && pectaYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <button onClick={() => window.print()} disabled={!selectedStudentId} style={{ height: "45px", padding: "0 25px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: selectedStudentId ? "pointer" : "not-allowed", opacity: selectedStudentId ? 1 : 0.5 }}>🖨️ Print Card</button>
          </div>
        </div>

        <div className="print-grid" style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "30px", alignItems: "start" }}>
          
          {/* ================= LEFT: MARKS ENTRY FORM ================= */}
          <div className="no-print" style={{ background: "white", padding: "25px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>Enter Marks (Out of 100)</h3>
            
            {selectedStudentId ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {Object.keys(marks).map((subject) => (
                  <div key={subject} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: "14px", fontWeight: "bold", color: "#475569", textTransform: "capitalize", width: "100px" }}>{subject}</label>
                    <input type="number" max="100" min="0" value={marks[subject as keyof typeof marks]} onChange={(e) => handleMarkChange(subject, e.target.value)} placeholder="0" style={{...inputStyle, width: "100px", textAlign: "center"}} />
                  </div>
                ))}
                
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "#166534", marginTop: "10px" }}>
                  <strong>Attendance Link:</strong> {attendanceStats.total} working days found for <strong>{examType} ({examSubType})</strong>.
                </div>

                <button onClick={saveMarks} disabled={isSaving} style={{ background: "#3ea2e0", color: "white", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: isSaving ? "not-allowed" : "pointer", marginTop: "10px" }}>
                  {isSaving ? "Saving..." : "💾 Save Marks"}
                </button>
              </div>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>Please select a student from the top menu to enter marks.</p>
            )}
          </div>

          {/* ================= RIGHT: LIVE RESULT CARD PREVIEW ================= */}
          <div className="print-only" style={{ background: "white", padding: "40px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", position: "relative", minHeight: "750px" }}>
            
            {schoolSettings?.logoUrl && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.04, zIndex: 0, pointerEvents: "none" }}>
                <img src={schoolSettings.logoUrl} alt="Watermark" style={{ width: "500px", height: "500px", objectFit: "contain" }} />
              </div>
            )}

            <div style={{ position: "relative", zIndex: 10 }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "4px solid #0f172a", paddingBottom: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                  {schoolSettings?.logoUrl && <img src={schoolSettings.logoUrl} alt="Logo" style={{ width: "80px", height: "80px", objectFit: "contain" }} />}
                  <div>
                    <h1 style={{ margin: "0 0 5px 0", fontSize: "28px", color: "#0f172a", textTransform: "uppercase", fontWeight: "900" }}>{schoolSettings?.schoolName || "EDUPILOT SCHOOL"}</h1>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>{schoolSettings?.tagline}</p>
                    <p style={{ margin: "8px 0 0 0", fontWeight: "bold", background: "#fef3c7", color: "#b45309", display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "13px" }}>
                      {examType.toUpperCase()} - {examSubType.toUpperCase()} PROGRESS REPORT
                    </p>
                  </div>
                </div>
                <div style={{ width: "90px", height: "100px", border: "2px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selectedStudent?.photoUrl ? <img src={selectedStudent.photoUrl} alt="Student" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "10px", color: "#94a3b8" }}>Photo</span>}
                </div>
              </div>

              {/* 🔥 NEW: Showing Father Name, Class & Section on Printed Result Card */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "30px", fontSize: "15px" }}>
                <div><strong>Student Name:</strong> {selectedStudent?.firstName ? `${selectedStudent.firstName} ${selectedStudent.lastName || ""}`.trim() : selectedStudent?.fullName || "__________________"}</div>
                <div><strong>Father's Name:</strong> {selectedStudent?.fatherName || "__________________"}</div>
                <div><strong>Class & Section:</strong> {selectedStudent?.studentClass || selectedStudent?.classSection || "______"} ({selectedStudent?.section || "N/A"})</div>
                <div><strong>Admission No:</strong> {selectedStudent?.admissionNo || "______"}</div>
                <div><strong>Date of Birth:</strong> {selectedStudent?.dob || "______"}</div>
                <div><strong>Gender:</strong> {selectedStudent?.gender || "______"}</div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
                <thead>
                  <tr style={{ background: "#0f172a", color: "white", textAlign: "left" }}>
                    <th style={thStyle}>Subject</th>
                    <th style={{...thStyle, textAlign: "center"}}>Total Marks</th>
                    <th style={{...thStyle, textAlign: "center"}}>Marks Obtained</th>
                    <th style={{...thStyle, textAlign: "center"}}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map(([subj, val]) => {
                    const obtained = Number(val) || 0;
                    return (
                      <tr key={subj} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{...tdStyle, textTransform: "capitalize", fontWeight: "bold"}}>{subj}</td>
                        <td style={{...tdStyle, textAlign: "center"}}>100</td>
                        <td style={{...tdStyle, textAlign: "center", fontWeight: "bold"}}>{obtained || "-"}</td>
                        <td style={{...tdStyle, textAlign: "center"}}>{obtained ? `${obtained}%` : "-"}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: "#f1f5f9", fontWeight: "900", fontSize: "16px" }}>
                    <td style={tdStyle}>GRAND TOTAL</td>
                    <td style={{...tdStyle, textAlign: "center"}}>{maxMarks}</td>
                    <td style={{...tdStyle, textAlign: "center", color: "#3ea2e0"}}>{totalObtained}</td>
                    <td style={{...tdStyle, textAlign: "center"}}>{percentage}%</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div style={{ border: "2px solid #e2e8f0", borderRadius: "12px", padding: "15px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" }}>Attendance Record</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "14px" }}><span>Total Working Days:</span> <strong>{attendanceStats.total}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "14px" }}><span>Days Present:</span> <strong style={{ color: "#10b981" }}>{attendanceStats.present}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}><span>Days Absent:</span> <strong style={{ color: "#ef4444" }}>{attendanceStats.total - attendanceStats.present}</strong></div>
                </div>
                <div style={{ background: "#0f172a", color: "white", borderRadius: "12px", padding: "15px", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ margin: 0, fontSize: "14px", color: "#94a3b8" }}>OVERALL GRADE</p>
                  <h2 style={{ margin: 0, fontSize: "48px", fontWeight: "900", color: grade === "F" ? "#ef4444" : "#10b981" }}>{grade}</h2>
                </div>
              </div>

              <div style={{ background: "#fef2f2", borderLeft: "4px solid #ef4444", padding: "10px 15px", borderRadius: "0 8px 8px 0", marginBottom: "40px" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#991b1b", fontSize: "14px" }}>Teacher Remarks:</h4>
                <p style={{ margin: 0, color: "#7f1d1d", fontSize: "14px", fontStyle: "italic" }}>"{selectedStudentId ? aiRemark : "Awaiting student data..."}"</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto" }}>
                <div style={{ borderTop: "1px solid #000", width: "200px", textAlign: "center", paddingTop: "5px", fontSize: "14px", fontWeight: "bold" }}>Class Teacher</div>
                <div style={{ borderTop: "1px solid #000", width: "200px", textAlign: "center", paddingTop: "5px", fontSize: "14px", fontWeight: "bold" }}>Principal Signature</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const navSectionLabel = { fontSize: "11px", fontWeight: "bold", color: "#94a3b8", marginTop: "25px", marginBottom: "10px", paddingLeft: "10px", letterSpacing: "1px" };
const navItem = { display: "flex", alignItems: "center", padding: "12px 10px", borderRadius: "0 8px 8px 0", color: "#475569", fontSize: "14px", fontWeight: "600", marginBottom: "2px" };
const activeNavItem = { ...navItem, background: "#eff6ff", color: "#3ea2e0", borderLeft: "3px solid #3ea2e0" };
const iconPlaceholder = { width: "24px", textAlign: "center" as const, marginRight: "12px", fontSize: "18px" };
const inputStyle = { padding: "12px 15px", width: "100%", boxSizing: "border-box" as const, border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", outline: "none", background: "white" };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: "bold", color: "#475569", marginBottom: "6px" };
const thStyle = { padding: "10px 15px", borderRight: "1px solid #334155" };
const tdStyle = { padding: "10px 15px", borderRight: "1px solid #e2e8f0" };