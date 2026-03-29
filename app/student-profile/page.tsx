"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";

export default function StudentProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");

  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else if (studentId) {
        setUser(currentUser);
        await loadStudentData(currentUser.uid, studentId);
      }
    });
    return () => unsubscribe();
  }, [router, studentId]);

  const loadStudentData = async (uid: string, sid: string) => {
    try {
      // 1. Fetch Student Info
      const studentSnap = await getDoc(doc(db, "users", uid, "students", sid));
      if (studentSnap.exists()) setStudent(studentSnap.data());

      // 2. Fetch Fee History
      const feeSnap = await getDocs(collection(db, "users", uid, "students", sid, "fees"));
      const feeData: any[] = [];
      feeSnap.forEach(doc => feeData.push({ id: doc.id, ...doc.data() }));
      setFees(feeData);

      // 3. Fetch Exam Results
      const marksSnap = await getDocs(collection(db, "users", uid, "students", sid, "marks"));
      const marksData: any[] = [];
      marksSnap.forEach(doc => marksData.push(doc.data()));
      setResults(marksData);

    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading 360° Profile...</div>;
  if (!student) return <div style={{ textAlign: "center", padding: "50px" }}>Student not found.</div>;

  // Calculations
  const totalFeesPaid = fees.reduce((sum, f) => sum + Number(f.totalAmount || 0), 0);

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "30px 20px", fontFamily: "sans-serif" }}>
      
      {/* NAVIGATION BAR */}
      <div style={{ display: "flex", background: "white", padding: "8px", borderRadius: "50px", width: "fit-content", margin: "0 auto 30px auto", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", gap: "5px" }}>
        <button onClick={() => router.push("/students")} style={activeNavBtn}>← Back to Students</button>
        <button onClick={() => router.push("/staff")} style={navBtn}>Staff & HR</button>
        <button onClick={() => router.push("/attendance")} style={navBtn}>Attendance</button>
        <button onClick={() => router.push("/fees")} style={navBtn}>Fees</button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* 🌟 TOP HEADER CARD: Personal Info */}
        <div style={{ background: "white", borderRadius: "24px", padding: "30px", display: "flex", gap: "30px", alignItems: "center", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", marginBottom: "30px", border: "1px solid #e2e8f0" }}>
          
          <div style={{ width: "120px", height: "120px", borderRadius: "20px", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", fontWeight: "bold", overflow: "hidden", border: "4px solid #f8fafc", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            {student.photoUrl ? <img src={student.photoUrl} alt="Student" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : student.fullName.charAt(0)}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: "0 0 5px 0", fontSize: "32px", color: "#0f172a" }}>{student.fullName}</h1>
            <p style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#64748b" }}>d/o {student.fatherName}</p>
            
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <span style={badgeStyle}>Class: <strong>{student.classSection}</strong></span>
              <span style={badgeStyle}>Roll/Adm No: <strong>{student.admissionNo}</strong></span>
              <span style={badgeStyle}>DOB: <strong>{student.dob}</strong></span>
              <span style={badgeStyle}>Gender: <strong>{student.gender}</strong></span>
            </div>
          </div>
        </div>

        {/* 🌟 3-COLUMN DASHBOARD GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px" }}>
          
          {/* COLUMN 1: Academics & Results */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>🎓 Academic History</h3>
            {results.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No exam results uploaded yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {results.map((res, i) => {
                  const termTotal = Object.values(res.marks).reduce((acc: any, curr: any) => acc + Number(curr || 0), 0) as number;
                  const percentage = ((termTotal / 600) * 100).toFixed(1);
                  return (
                    <div key={i} style={{ background: "#f8fafc", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#0f172a", textTransform: "capitalize" }}>{res.term} Term</h4>
                        <span style={{ fontSize: "12px", color: "#64748b" }}>Score: {termTotal} / 600</span>
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: "900", color: Number(percentage) >= 50 ? "#10b981" : "#ef4444" }}>
                        {percentage}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={() => router.push(`/result?studentId=${studentId}`)} style={{ width: "100%", marginTop: "15px", padding: "12px", background: "#eff6ff", color: "#0ea5e9", border: "1px solid #bae6fd", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>View Full Result Card</button>
          </div>

          {/* COLUMN 2: Financials & Fees */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>💰 Financial Record</h3>
            <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "16px", border: "1px solid #bbf7d0", marginBottom: "20px", textAlign: "center" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#166534", fontWeight: "bold" }}>Total Fee Submitted</p>
              <h2 style={{ margin: 0, fontSize: "36px", color: "#15803d", fontWeight: "900" }}>Rs. {totalFeesPaid.toLocaleString()}</h2>
            </div>

            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#64748b" }}>Recent Vouchers:</h4>
            {fees.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No fee records found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto" }}>
                {fees.slice(0, 5).map((f) => (
                  <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                    <span style={{ color: "#334155" }}>{f.issueDate}</span>
                    <strong style={{ color: "#0f172a" }}>Rs. {f.totalAmount}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 3: Behavior & Assignments */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>⭐ Behavior & Tasks</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>General Behavior</label>
              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#334155" }}>
                Active in class. Needs to focus more on Math assignments. Good discipline overall.
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" }}>Recent Assignments</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ padding: "10px", background: "#fef2f2", color: "#991b1b", borderLeft: "4px solid #ef4444", borderRadius: "6px", fontSize: "13px" }}>❌ Failed: Science Project (Chapter 4)</div>
                <div style={{ padding: "10px", background: "#f0fdf4", color: "#166534", borderLeft: "4px solid #22c55e", borderRadius: "6px", fontSize: "13px" }}>✅ Done: English Essay</div>
                <div style={{ padding: "10px", background: "#f0fdf4", color: "#166534", borderLeft: "4px solid #22c55e", borderRadius: "6px", fontSize: "13px" }}>✅ Done: Urdu Reading Task</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

// Styling
const activeNavBtn = { background: "#0f172a", color: "white", border: "none", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" };
const navBtn = { background: "transparent", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" };
const badgeStyle = { background: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", color: "#334155", border: "1px solid #e2e8f0" };
const cardStyle = { background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };
const cardHeaderStyle = { margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" };