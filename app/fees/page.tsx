"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";

export default function FeeManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [previousArrears, setPreviousArrears] = useState<number>(0);
  
  const [currentCategory, setCurrentCategory] = useState("Monthly Fee");
  const [currentAmount, setCurrentAmount] = useState<number | "">("");
  const [applyTax, setApplyTax] = useState(false);
  const [taxRate, setTaxRate] = useState<number>(5); 

  const [feeItems, setFeeItems] = useState<any[]>([]);

  const categories = [ "Admission Fee", "Monthly Fee", "Examination Fee", "Surcharge", "Fine", "Books", "Notebooks", "Uniform", "Other" ];

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
      const settingsSnap = await getDoc(doc(db, "users", uid, "settings", "branding"));
      if (settingsSnap.exists()) setSchoolSettings(settingsSnap.data());

      const studentSnap = await getDocs(collection(db, "users", uid, "students"));
      const studentData: any[] = [];
      studentSnap.forEach((doc) => studentData.push({ id: doc.id, ...doc.data() }));
      setStudents(studentData);
    } catch (error) { console.error("Fetch error:", error); } finally { setLoading(false); }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const addItem = () => {
    if (!currentAmount || Number(currentAmount) <= 0) return;
    const amount = Number(currentAmount);
    const taxAmount = applyTax ? (amount * (taxRate / 100)) : 0;
    const total = amount + taxAmount;
    setFeeItems([...feeItems, { id: Date.now().toString(), category: currentCategory, amount, taxRate: applyTax ? taxRate : 0, taxAmount, total }]);
    setCurrentAmount(""); setApplyTax(false);
  };

  const removeItem = (id: string) => setFeeItems(feeItems.filter(item => item.id !== id));

  const saveAndPrint = async () => {
    if (!selectedStudent) return alert("Please select a student!");
    if (feeItems.length === 0) return alert("Please add at least one fee item.");
    try {
      setIsSaving(true);
      await addDoc(collection(db, "users", user.uid, "students", selectedStudentId, "fees"), {
        issueDate, dueDate, previousArrears, items: feeItems, totalAmount: grandTotal, status: "Unpaid", createdAt: new Date()
      });
      window.print();
      setFeeItems([]); setPreviousArrears(0); setSelectedStudentId("");
    } catch (error: any) { alert("Error saving: " + error.message); } finally { setIsSaving(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const currentTotal = feeItems.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = currentTotal + Number(previousArrears);

  if (loading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="edu-spinner"></div><h2 style={{ color: "white", fontSize: "32px", fontWeight: "900", letterSpacing: "2px", margin: "20px 0 10px 0" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h2><p className="edu-pulse-text" style={{ color: "#94a3b8" }}>Loading Finance Module...</p>
        <style>{`.edu-spinner { width: 50px; height: 50px; border: 4px solid rgba(62, 162, 224, 0.1); border-left-color: #3ea2e0; border-radius: 50%; animation: edu-spin 1s linear infinite; } @keyframes edu-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .edu-pulse-text { animation: edu-pulse 1.5s ease-in-out infinite; } @keyframes edu-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 0 !important; }
          .print-grid { display: block !important; gap: 0 !important; margin: 0 !important; }
          .print-only { box-shadow: none !important; border: none !important; width: 100% !important; max-width: 100% !important; margin: 0 auto !important; padding: 0 !important; min-height: auto !important; transform: scale(0.95); transform-origin: top center; }
        }
        .nav-item { transition: all 0.2s; border-left: 3px solid transparent; }
        .nav-item:hover { background: #f8fafc; color: #3ea2e0 !important; cursor: pointer; border-left: 3px solid #3ea2e0; }
        .logout-btn:hover { text-decoration: underline; }
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
          <div onClick={() => router.push("/result")} className="nav-item" style={navItem}><span style={iconPlaceholder}>📄</span> Term Results</div>
          <div style={navSectionLabel}>FINANCE</div>
          <div style={activeNavItem}><span style={iconPlaceholder}>💰</span> Fee Management</div>
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
      <div className="main-content print-grid" style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        
        <div className="print-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", maxWidth: "1400px", margin: "0 auto", alignItems: "start" }}>
          
          <div className="no-print" style={{ background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#0f172a" }}>Generate Fee Receipt</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "30px" }}>
              <div>
                <label style={labelStyle}>Select Student</label>
                <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} style={inputStyle}>
                  <option value="">-- Choose a Student --</option>
                  {/* 🔥 NEW: Explicitly rendering Father Name and Section in dropdown */}
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.fullName || s.firstName} S/O {s.fatherName || "N/A"} - {s.studentClass || s.classSection || "N/A"} ({s.section || "N/A"}) - Adm: {s.admissionNo}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}><label style={labelStyle}>Issue Date</label><input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} style={inputStyle} /></div>
                <div style={{ flex: 1 }}><label style={labelStyle}>Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} /></div>
              </div>
              <div><label style={labelStyle}>Previous Arrears / Balance (Rs.)</label><input type="number" value={previousArrears} onChange={(e) => setPreviousArrears(Number(e.target.value))} placeholder="0" style={inputStyle} /></div>
            </div>

            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#3b82f6" }}>Add Fee Details</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
                <div><label style={labelStyle}>Category Catalog</label><select value={currentCategory} onChange={(e) => setCurrentCategory(e.target.value)} style={inputStyle}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={labelStyle}>Amount (Rs.)</label><input type="number" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value ? Number(e.target.value) : "")} placeholder="Enter Amount" style={inputStyle} /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "15px", background: "white", padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>
                  <input type="checkbox" checked={applyTax} onChange={(e) => setApplyTax(e.target.checked)} style={{ width: "18px", height: "18px", cursor: "pointer" }} /> Apply Surcharge / Tax
                </label>
                {applyTax && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><span style={{ fontSize: "14px", color: "#64748b" }}>Rate (%):</span><input type="number" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} style={{...inputStyle, width: "80px", padding: "6px 10px"}} /></div>}
              </div>
              <button onClick={addItem} style={{ width: "100%", background: "#0f172a", color: "white", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "bold", marginTop: "15px", cursor: "pointer" }}>+ Add to Receipt</button>
            </div>

            <button onClick={saveAndPrint} disabled={isSaving || !selectedStudent || feeItems.length === 0} style={{ width: "100%", background: "#10b981", color: "white", padding: "16px", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", marginTop: "30px", cursor: (isSaving || !selectedStudent || feeItems.length === 0) ? "not-allowed" : "pointer", opacity: (isSaving || !selectedStudent || feeItems.length === 0) ? 0.6 : 1 }}>
              {isSaving ? "Saving..." : "💾 Save & Print Receipt"}
            </button>
          </div>

          <div className="print-only" style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", position: "relative", overflow: "hidden", minHeight: "600px" }}>
            {schoolSettings?.logoUrl && <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.05, zIndex: 0, pointerEvents: "none" }}><img src={schoolSettings.logoUrl} alt="Watermark" style={{ width: "400px", height: "400px", objectFit: "contain" }} /></div>}
            <div style={{ position: "relative", zIndex: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #0f172a", paddingBottom: "20px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  {schoolSettings?.logoUrl && <img src={schoolSettings.logoUrl} alt="Logo" style={{ width: "70px", height: "70px", objectFit: "contain" }} />}
                  <div>
                    <h1 style={{ margin: "0 0 5px 0", fontSize: "24px", color: "#0f172a", textTransform: "uppercase" }}>{schoolSettings?.schoolName || "EDUPILOT SCHOOL"}</h1>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>{schoolSettings?.tagline}</p>
                    <p style={{ margin: "5px 0 0 0", fontWeight: "bold", background: "#fef3c7", color: "#b45309", display: "inline-block", padding: "3px 8px", borderRadius: "4px", fontSize: "12px" }}>FEE VOUCHER</p>
                  </div>
                </div>
                <div style={{ width: "80px", height: "90px", border: "2px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selectedStudent?.photoUrl ? <img src={selectedStudent.photoUrl} alt="Student" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "10px", color: "#94a3b8" }}>No Photo</span>}
                </div>
              </div>

              {/* 🔥 NEW: Showing Father Name, Class & Section on Printed Voucher */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "#f8fafc", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "25px", fontSize: "14px" }}>
                <div><strong>Student Name:</strong> {selectedStudent?.fullName || selectedStudent?.firstName || "__________________"}</div>
                <div><strong>Father's Name:</strong> {selectedStudent?.fatherName || "__________________"}</div>
                <div><strong>Class & Section:</strong> {selectedStudent?.studentClass || selectedStudent?.classSection || "______"} ({selectedStudent?.section || "N/A"})</div>
                <div><strong>Admission No:</strong> {selectedStudent?.admissionNo || "______"}</div>
                <div><strong>Issue Date:</strong> {issueDate}</div>
                <div style={{ color: "#dc2626" }}><strong>Due Date:</strong> {dueDate || "___________"}</div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px", fontSize: "14px" }}>
                <thead><tr style={{ background: "#0f172a", color: "white", textAlign: "left" }}><th style={thStyle}>#</th><th style={thStyle}>Category</th><th style={thStyle}>Amount</th><th style={thStyle}>Tax</th><th style={thStyle}>Total (Rs)</th><th className="no-print" style={thStyle}>Action</th></tr></thead>
                <tbody>
                  {feeItems.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>No items added.</td></tr>}
                  {feeItems.map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={tdStyle}>{index + 1}</td><td style={tdStyle}><strong>{item.category}</strong></td><td style={tdStyle}>{item.amount}</td><td style={tdStyle}>{item.taxAmount > 0 ? `${item.taxAmount} (${item.taxRate}%)` : "-"}</td><td style={tdStyle}><strong>{item.total}</strong></td>
                      <td className="no-print" style={tdStyle}><button onClick={() => removeItem(item.id)} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", padding: "4px 8px" }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: "300px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "15px", fontSize: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span>Current Total:</span> <strong>Rs. {currentTotal}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", color: "#dc2626" }}><span>Previous Arrears:</span> <strong>Rs. {previousArrears}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #0f172a", paddingTop: "10px", marginTop: "10px", fontSize: "18px", fontWeight: "900", color: "#0f172a" }}><span>GRAND TOTAL:</span> <span>Rs. {grandTotal}</span></div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "60px" }}>
                <div style={{ borderTop: "1px solid #000", width: "200px", textAlign: "center", paddingTop: "5px", fontSize: "12px", fontWeight: "bold" }}>Cashier / Accountant</div>
                <div style={{ borderTop: "1px solid #000", width: "200px", textAlign: "center", paddingTop: "5px", fontSize: "12px", fontWeight: "bold" }}>Bank Stamp & Signature</div>
              </div>
              <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "30px" }}>System Generated Receipt by EduPilot.</p>
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
const inputStyle = { padding: "12px 15px", width: "100%", boxSizing: "border-box" as const, border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", outline: "none", background: "white" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "6px" };
const thStyle = { padding: "12px", borderRight: "1px solid #334155" };
const tdStyle = { padding: "12px", borderRight: "1px solid #e2e8f0" };