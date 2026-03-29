"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, addDoc } from "firebase/firestore";

export default function StaffProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const staffId = searchParams.get("staffId");

  const [user, setUser] = useState<any>(null);
  const [staff, setStaff] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI Payslip Simulation State
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else if (staffId) {
        setUser(currentUser);
        await loadStaffData(currentUser.uid, staffId);
      }
    });
    return () => unsubscribe();
  }, [router, staffId]);

  const loadStaffData = async (uid: string, sid: string) => {
    try {
      const staffSnap = await getDoc(doc(db, "users", uid, "staff", sid));
      if (staffSnap.exists()) setStaff(staffSnap.data());

      const slipSnap = await getDocs(collection(db, "users", uid, "staff", sid, "payslips"));
      const slipData: any[] = [];
      slipSnap.forEach(doc => slipData.push({ id: doc.id, ...doc.data() }));
      setPayslips(slipData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayslipUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !user || !staffId) return;

    // Simulate AI OCR Data Extraction (Takes 2 seconds)
    setIsExtracting(true);
    
    setTimeout(async () => {
      const extractedData = {
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        basicPay: staff.basicSalary || "55000",
        medicalAllowance: "2500",
        houseRent: "5000",
        grossPay: Number(staff.basicSalary || 55000) + 7500,
        uploadedAt: new Date()
      };

      // Save extracted data to database
      await addDoc(collection(db, "users", user.uid, "staff", staffId as string, "payslips"), extractedData);
      
      // Reload Payslips
      const slipSnap = await getDocs(collection(db, "users", user.uid, "staff", staffId as string, "payslips"));
      const slipData: any[] = [];
      slipSnap.forEach(doc => slipData.push({ id: doc.id, ...doc.data() }));
      setPayslips(slipData);

      setIsExtracting(false);
      e.target.value = ""; // Reset input
    }, 2500);
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading HR Profile...</div>;
  if (!staff) return <div style={{ textAlign: "center", padding: "50px" }}>Staff record not found.</div>;

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "30px 20px", fontFamily: "sans-serif" }}>
      
      {/* NAVIGATION BAR */}
      <div style={{ display: "flex", background: "white", padding: "8px", borderRadius: "50px", width: "fit-content", margin: "0 auto 30px auto", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", gap: "5px" }}>
        <button onClick={() => router.push("/students")} style={navBtn}>Students</button>
        <button onClick={() => router.push("/staff")} style={activeNavBtn}>← Back to HR</button>
        <button onClick={() => router.push("/attendance")} style={navBtn}>Attendance</button>
        <button onClick={() => router.push("/fees")} style={navBtn}>Fees</button>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* 🌟 TOP HEADER CARD: Personal Info */}
        <div style={{ background: "white", borderRadius: "24px", padding: "30px", display: "flex", gap: "30px", alignItems: "center", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", marginBottom: "30px", border: "1px solid #e2e8f0" }}>
          
          <div style={{ width: "120px", height: "120px", borderRadius: "20px", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", fontWeight: "bold", overflow: "hidden", border: "4px solid #f8fafc", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
            {staff.photoUrl ? <img src={staff.photoUrl} alt="Staff" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : staff.fullName.charAt(0)}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: "0 0 5px 0", fontSize: "32px", color: "#0f172a" }}>{staff.fullName} <span style={{ fontSize: "14px", background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "12px", verticalAlign: "middle", marginLeft: "10px" }}>{staff.designation}</span></h1>
            <p style={{ margin: "0 0 15px 0", fontSize: "15px", color: "#64748b" }}>CNIC: {staff.cnic} | Phone: {staff.phone}</p>
            
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <span style={badgeStyle}>Gender: <strong>{staff.gender}</strong></span>
              <span style={badgeStyle}>Academic: <strong>{staff.academicEdu || "N/A"}</strong></span>
              <span style={badgeStyle}>Professional: <strong>{staff.profEdu || "N/A"}</strong></span>
            </div>
          </div>
        </div>

        {/* 🌟 3-COLUMN HR GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px" }}>
          
          {/* COLUMN 1: Medical & Experience */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>🏥 Medical & Experience</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Medical Information / Fitness</label>
              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#334155", minHeight: "60px" }}>
                {staff.medicalInfo || "No medical history or allergies recorded. Declared medically fit for service."}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Past Experience</label>
              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#334155", minHeight: "80px" }}>
                {staff.pastExp || "No past experience provided. Fresh joining."}
              </div>
            </div>
          </div>

          {/* COLUMN 2: Payroll & AI Payslip Extraction */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>💸 Payroll & Slips</h3>
            <div style={{ background: "#f0fdf4", padding: "20px", borderRadius: "16px", border: "1px solid #bbf7d0", marginBottom: "20px", textAlign: "center" }}>
              <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#166534", fontWeight: "bold" }}>Basic Salary Assigned</p>
              <h2 style={{ margin: 0, fontSize: "36px", color: "#15803d", fontWeight: "900" }}>Rs. {Number(staff.basicSalary).toLocaleString() || 0}</h2>
            </div>

            {/* AI UPLOAD ZONE */}
            <div style={{ border: "2px dashed #cbd5e1", padding: "20px", borderRadius: "12px", textAlign: "center", background: "#f8fafc", marginBottom: "20px" }}>
              {isExtracting ? (
                <div style={{ color: "#3b82f6", fontWeight: "bold", fontSize: "14px", animation: "pulse 1.5s infinite" }}>⚙️ Extracting Data with AI...</div>
              ) : (
                <>
                  <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#64748b", fontWeight: "bold" }}>Upload Govt/Private Payslip Image</p>
                  <label style={{ background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", display: "inline-block" }}>
                    Choose File to Auto-Fill
                    <input type="file" accept="image/*, .pdf" style={{ display: "none" }} onChange={handlePayslipUpload} />
                  </label>
                </>
              )}
            </div>

            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#64748b" }}>Extracted Payslips:</h4>
            {payslips.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No payslips uploaded.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "150px", overflowY: "auto" }}>
                {payslips.map((slip) => (
                  <div key={slip.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px" }}>
                    <div>
                      <strong style={{ display: "block", color: "#0f172a" }}>{slip.month}</strong>
                      <span style={{ color: "#64748b" }}>Basic: {slip.basicPay} | Allow: {slip.medicalAllowance}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "11px", color: "#10b981", background: "#d1fae5", padding: "2px 6px", borderRadius: "4px" }}>Extracted ✓</span>
                      <strong style={{ display: "block", color: "#0f172a", marginTop: "3px" }}>Rs. {slip.grossPay}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 3: ACRs & Disciplinary */}
          <div style={cardStyle}>
            <h3 style={cardHeaderStyle}>📜 Govt ACRs & Records</h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Annual Confidential Reports (ACRs)</label>
              <div style={{ background: "#eff6ff", padding: "15px", borderRadius: "10px", border: "1px solid #bfdbfe", fontSize: "14px", color: "#1e3a8a", minHeight: "80px" }}>
                {staff.acrs || "No ACRs submitted for the current fiscal year."}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#991b1b", marginBottom: "5px" }}>Warnings & Punishments</label>
              <div style={{ background: "#fef2f2", padding: "15px", borderRadius: "10px", border: "1px solid #fecaca", fontSize: "14px", color: "#991b1b", minHeight: "60px" }}>
                {staff.punishments || "Clean record. No disciplinary actions taken."}
              </div>
            </div>

          </div>

        </div>
      </div>
      <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
    </div>
  );
}

// Styling
const activeNavBtn = { background: "#0f172a", color: "white", border: "none", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" };
const navBtn = { background: "transparent", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s" };
const badgeStyle = { background: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", color: "#334155", border: "1px solid #e2e8f0" };
const cardStyle = { background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" };
const cardHeaderStyle = { margin: "0 0 20px 0", color: "#0f172a", fontSize: "18px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" };
const labelStyle = { display: "block", fontSize: "13px", fontWeight: "bold", color: "#64748b", marginBottom: "5px" };