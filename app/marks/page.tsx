"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const EXAM_STRUCTURE: Record<string, Record<string, string[]>> = {
  "1. Periodic/Internal Examinations (School-Based)": {
    "Monthly Tests/Class Tests": ["Class Test", "Monthly Test", "Custom"],
    "Terminals": ["1st Term", "2nd Term", "3rd Term", "Custom"],
    "Mid-Term": ["Mid-Term Exam", "Custom"],
    "Final Term/Annual Exams": ["Final Term", "Annual Exam", "Custom"],
    "School-Based Assessment (SBA)": ["SBA Exam", "Custom"],
    "Send-ups/Pre-Boards": ["Send-ups", "Pre-Boards", "Custom"]
  },
  "2. Modern Assessment Terminology": {
    "SLOs (Students Learning Outcomes)": ["SLO Based Exam", "Custom"],
    "Formative Assessment": ["Formative Quiz", "Formative Assignment", "Custom"],
    "Summative Assessment": ["Summative Unit Exam", "Summative Final", "Custom"]
  }
};

function GradingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const studentId = searchParams.get("studentId");
  const studentName = searchParams.get("name");

  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [termLoaded, setTermLoaded] = useState(false);

  const [cat1, setCat1] = useState("1. Periodic/Internal Examinations (School-Based)");
  const [cat2, setCat2] = useState("Terminals");
  const [cat3, setCat3] = useState("1st Term");
  const [customTerm, setCustomTerm] = useState("");

  const finalTermName = cat3 === "Custom" ? (customTerm || "Custom Exam") : cat3;

  const [marks, setMarks] = useState({
    urdu: "", english: "", math: "", science: "", pakStudies: "", islamiat: ""
  });
  const [attendance, setAttendance] = useState({
    totalDays: "30", presentDays: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) router.push("/login");
      else setUser(currentUser);
    });
    return () => unsubscribe();
  }, [router]);

  const handleCat1Change = (e: any) => {
    const newCat1 = e.target.value;
    setCat1(newCat1);
    const newCat2 = Object.keys(EXAM_STRUCTURE[newCat1])[0];
    setCat2(newCat2);
    setCat3(EXAM_STRUCTURE[newCat1][newCat2][0]);
    setTermLoaded(false);
  };

  const handleCat2Change = (e: any) => {
    const newCat2 = e.target.value;
    setCat2(newCat2);
    setCat3(EXAM_STRUCTURE[cat1][newCat2][0]);
    setTermLoaded(false);
  };

  const loadMarks = async () => {
    if (!user || !studentId) return;
    try {
      const safeDocId = finalTermName.replace(/\//g, "-");
      const docRef = doc(db, "users", user.uid, "students", studentId, "marks", safeDocId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMarks(data.marks || { urdu: "", english: "", math: "", science: "", pakStudies: "", islamiat: "" });
        setAttendance(data.attendance || { totalDays: "30", presentDays: "" });
      } else {
        setMarks({ urdu: "", english: "", math: "", science: "", pakStudies: "", islamiat: "" });
        setAttendance({ totalDays: "30", presentDays: "" });
      }
      setTermLoaded(true);
    } catch (error) {
      console.error("Error loading marks:", error);
    }
  };

  const handleMarkChange = (subject: string, value: string) => {
    if (Number(value) > 100) value = "100";
    setMarks((prev) => ({ ...prev, [subject]: value }));
  };

  const saveResult = async () => {
    if (!user || !studentId) return;
    try {
      setIsSaving(true);
      const safeDocId = finalTermName.replace(/\//g, "-");
      const docRef = doc(db, "users", user.uid, "students", studentId, "marks", safeDocId);
      
      await setDoc(docRef, {
        term: finalTermName,
        category: cat1,
        subCategory: cat2,
        marks: marks,
        attendance: attendance,
        // Added timestamp for accurate multi-term sorting
        createdAt: new Date().getTime() 
      });

      alert("Result Card Saved Successfully.");
      router.push("/students"); 
    } catch (error: any) {
      alert("Save Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const totalObtained = Object.values(marks).reduce((acc, curr) => acc + Number(curr || 0), 0);
  const percentage = ((totalObtained / 600) * 100).toFixed(1);

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      
      <div style={{ background: "#0a192f", padding: "20px", borderRadius: "8px", color: "white", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: "0 0 5px 0", color: "#fbbf24" }}>STUDENT RESULT CARD</h2>
          <h3 style={{ margin: 0 }}>{studentName}</h3>
        </div>
        <button onClick={() => router.push("/students")} style={{ background: "#475569", color: "white", border: "none", padding: "8px 15px", borderRadius: "5px", cursor: "pointer" }}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
        <h4 style={{ marginTop: 0, color: "#0f172a", marginBottom: "15px" }}>Assessment Details Setup</h4>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px" }}>
          <div>
            <label style={labelStyle}>1. Select Main Category</label>
            <select value={cat1} onChange={handleCat1Change} style={inputStyle}>
              {Object.keys(EXAM_STRUCTURE).map((key) => <option key={key} value={key}>{key}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>2. Select Exam Type</label>
            <select value={cat2} onChange={handleCat2Change} style={inputStyle}>
              {Object.keys(EXAM_STRUCTURE[cat1]).map((key) => <option key={key} value={key}>{key}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>3. Select Final Term Name</label>
            <select value={cat3} onChange={(e) => { setCat3(e.target.value); setTermLoaded(false); }} style={inputStyle}>
              {EXAM_STRUCTURE[cat1][cat2].map((termOpt) => <option key={termOpt} value={termOpt}>{termOpt}</option>)}
            </select>
          </div>
          {cat3 === "Custom" && (
            <div>
              <label style={labelStyle}>4. Enter Custom Name</label>
              <input type="text" value={customTerm} onChange={(e) => { setCustomTerm(e.target.value); setTermLoaded(false); }} placeholder="Type exam name..." style={inputStyle} />
            </div>
          )}

          <button onClick={loadMarks} style={{ background: "#3b82f6", color: "white", padding: "12px", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}>
            Confirm and Load Data Table
          </button>
        </div>
      </div>

      {termLoaded && (
        <>
          <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ padding: "15px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: "bold", color: "#0f172a" }}>
              Entering marks for: {finalTermName}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead style={{ background: "#0f172a", color: "white" }}>
                <tr>
                  <th style={{ padding: "12px 15px" }}>SUBJECT</th>
                  <th style={{ padding: "12px 15px", textAlign: "center" }}>TOTAL</th>
                  <th style={{ padding: "12px 15px" }}>OBTAINED MARKS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "urdu", label: "Urdu" },
                  { id: "english", label: "English" },
                  { id: "math", label: "Math" },
                  { id: "science", label: "Science" },
                  { id: "pakStudies", label: "Pakistan Studies" },
                  { id: "islamiat", label: "Islamiat" }
                ].map((subj, index) => (
                  <tr key={subj.id} style={{ borderBottom: "1px solid #e2e8f0", background: index % 2 === 0 ? "#f8fafc" : "white" }}>
                    <td style={{ padding: "12px 15px", fontWeight: "bold", color: "#334155" }}>{subj.label}</td>
                    <td style={{ padding: "12px 15px", textAlign: "center", fontWeight: "bold", color: "#64748b" }}>100</td>
                    <td style={{ padding: "12px 15px" }}>
                      <input type="number" max="100" min="0" value={(marks as any)[subj.id]} onChange={(e) => handleMarkChange(subj.id, e.target.value)} placeholder="0 - 100" style={{ padding: "8px", width: "100px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "16px" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ background: "#f1f5f9", fontWeight: "bold" }}>
                <tr>
                  <td style={{ padding: "15px", color: "#0f172a", fontSize: "18px" }}>TOTAL MARKS</td>
                  <td style={{ padding: "15px", textAlign: "center", fontSize: "18px", color: "#0f172a" }}>600</td>
                  <td style={{ padding: "15px", fontSize: "18px", color: "#2563eb" }}>{totalObtained} / 600 ({percentage}%)</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Total Days</label>
              <input type="number" value={attendance.totalDays} onChange={(e) => setAttendance({...attendance, totalDays: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Present Days</label>
              <input type="number" value={attendance.presentDays} onChange={(e) => setAttendance({...attendance, presentDays: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Absent Days</label>
              <input type="text" disabled value={Number(attendance.totalDays) - Number(attendance.presentDays || 0)} style={{ ...inputStyle, background: "#f1f5f9", color: "#ef4444", fontWeight: "bold" }} />
            </div>
          </div>

          <button onClick={saveResult} disabled={isSaving} style={{ width: "100%", background: isSaving ? "#94a3b8" : "#10b981", color: "white", padding: "15px", border: "none", borderRadius: "8px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "18px", fontWeight: "bold" }}>
            {isSaving ? "Saving Data..." : "Save Result Card Data"}
          </button>
        </>
      )}

    </div>
  );
}

export default function MarksPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading System...</div>}>
      <GradingForm />
    </Suspense>
  );
}

const inputStyle = { padding: "10px", width: "100%", boxSizing: "border-box" as const, border: "1px solid #ccc", borderRadius: "5px", fontSize: "15px" };
const labelStyle = { display: "block", fontSize: "14px", fontWeight: "bold", color: "#334155", marginBottom: "5px" };