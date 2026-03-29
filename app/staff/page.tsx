"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";

export default function StaffManagement() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // 🔥 NEW: Check if Government School
  const [isGovtSchool, setIsGovtSchool] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "", cnic: "", phone: "", designation: "Teacher", gender: "Male",
    academicEdu: "", profEdu: "", basicSalary: "", acrs: "", punishments: "", 
    medicalInfo: "", pastExp: "", photoUrl: ""
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      // 1. Check School Settings for Govt Status
      const settingsSnap = await getDoc(doc(db, "users", uid, "settings", "branding"));
      if (settingsSnap.exists()) {
        const category = settingsSnap.data().schoolCategory;
        if (category && category.toLowerCase().includes("government")) {
          setIsGovtSchool(true);
        }
      }

      // 2. Fetch Staff
      const snapshot = await getDocs(collection(db, "users", uid, "staff"));
      const data: any[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setStaffList(data);
    } catch (error: any) { 
      console.error("Fetch Error:", error.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleInputChange = (e: any) => { const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: value })); };

  // 🔥 NEW: Handle OCR Payslip Upload
  const handlePayslipUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsExtracting(true);
      
      // Create FormData to send to our Next.js API
      const apiData = new FormData();
      apiData.append("file", file);

      // Call our secure backend OCR route
      const response = await fetch("/api/ocr", {
        method: "POST",
        body: apiData,
      });

      const result = await response.json();

      if (result.success) {
        // Auto-fill the form with the AI's extracted data!
        setFormData(prev => ({
          ...prev,
          fullName: result.data.fullName || prev.fullName,
          cnic: result.data.cnic || prev.cnic,
          designation: result.data.designation || prev.designation,
          basicSalary: result.data.basicSalary || prev.basicSalary,
          academicEdu: result.data.academicEdu || prev.academicEdu,
          profEdu: result.data.profEdu || prev.profEdu,
        }));
        alert("Slip scanned successfully! Form auto-filled.");
      } else {
        alert("Failed to read slip.");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to AI service.");
    } finally {
      setIsExtracting(false);
      e.target.value = ""; // Reset file input
    }
  };

  const uploadPhotoToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file); data.append("upload_preset", "edupilot_preset"); data.append("cloud_name", "dnnp0uut5"); 
    const res = await fetch("https://api.cloudinary.com/v1_1/dnnp0uut5/image/upload", { method: "POST", body: data });
    const uploadedImage = await res.json();
    return uploadedImage.secure_url;
  };

  const saveStaff = async (e: any) => {
    e.preventDefault();
    if (!user || formData.fullName.trim() === "") return;
    try {
      setIsUploading(true);
      const staffData: any = { ...formData };
      if (photo) staffData.photoUrl = await uploadPhotoToCloudinary(photo);

      if (editingId) await updateDoc(doc(db, "users", user.uid, "staff", editingId), staffData);
      else { staffData.joinedAt = new Date(); await addDoc(collection(db, "users", user.uid, "staff"), staffData); }
      
      setFormData({ fullName: "", cnic: "", phone: "", designation: "Teacher", gender: "Male", academicEdu: "", profEdu: "", basicSalary: "", acrs: "", punishments: "", medicalInfo: "", pastExp: "", photoUrl: "" });
      setPhoto(null); setEditingId(null);
      const fileInput = document.getElementById("photo-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchInitialData(user.uid);
    } catch (error: any) { alert("Save Error: " + error.message); } finally { setIsUploading(false); }
  };

  const startEdit = (staff: any) => {
    setFormData({ fullName: staff.fullName || "", cnic: staff.cnic || "", phone: staff.phone || "", designation: staff.designation || "Teacher", gender: staff.gender || "Male", academicEdu: staff.academicEdu || "", profEdu: staff.profEdu || "", basicSalary: staff.basicSalary || "", acrs: staff.acrs || "", punishments: staff.punishments || "", medicalInfo: staff.medicalInfo || "", pastExp: staff.pastExp || "", photoUrl: staff.photoUrl || "" });
    setEditingId(staff.id);
  };

  const deleteStaff = async (id: string) => {
    if (window.confirm("Permanently delete this staff record?")) { await deleteDoc(doc(db, "users", user.uid, "staff", id)); fetchInitialData(user.uid); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const filteredStaff = staffList.filter(s => s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.designation.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="edu-spinner"></div><h2 style={{ color: "white", fontSize: "32px", fontWeight: "900", letterSpacing: "2px", margin: "20px 0 10px 0" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h2><p className="edu-pulse-text" style={{ color: "#94a3b8" }}>Loading HR Module...</p>
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
          <div onClick={() => router.push("/attendance")} className="nav-item" style={navItem}><span style={iconPlaceholder}>⏱️</span> Daily Attendance</div>
          <div onClick={() => router.push("/result")} className="nav-item" style={navItem}><span style={iconPlaceholder}>📄</span> Term Results</div>
          <div style={navSectionLabel}>FINANCE</div>
          <div onClick={() => router.push("/fees")} className="nav-item" style={navItem}><span style={iconPlaceholder}>💰</span> Fee Management</div>
          <div style={navSectionLabel}>STAFF & OPS</div>
          <div style={activeNavItem}><span style={iconPlaceholder}>🧑‍🏫</span> HR & Teachers</div>
          <div style={navSectionLabel}>SYSTEM</div>
          <div onClick={() => router.push("/settings")} className="nav-item" style={navItem}><span style={iconPlaceholder}>⚙️</span> School Settings</div>
        </div>
        <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", marginTop: "auto", background: "#f8fafc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>{user?.email?.charAt(0).toUpperCase() || "A"}</div><div><p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>System Admin</p><p onClick={handleLogout} className="logout-btn" style={{ margin: 0, fontSize: "12px", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Logout Securely</p></div></div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT AREA */}
      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "30px", maxWidth: "1300px", alignItems: "start" }}>
          
          {/* Registration Form */}
          <div style={{ background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6" }}>
            <div style={{ textAlign: "center", marginBottom: "25px" }}><h2 style={{ margin: "0 0 5px 0", color: "#0f172a", fontSize: "22px" }}>{editingId ? "Edit Staff Profile" : "Register New Staff"}</h2><p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>Enter biodata, education, and payroll info.</p></div>
            
            {/* 🔥 GOVERNMENT OCR UPLOAD ZONE */}
            {isGovtSchool && !editingId && (
              <div style={{ background: "#e0f2fe", border: "1px dashed #7dd3fc", padding: "15px", borderRadius: "12px", marginBottom: "20px", textAlign: "center" }}>
                <h4 style={{ margin: "0 0 5px 0", color: "#0369a1", fontSize: "14px" }}>🤖 AI Auto-Fill (Govt Format)</h4>
                <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#0284c7" }}>Upload a clear photo of the PIFRA / Govt Salary Slip.</p>
                
                {isExtracting ? (
                  <div style={{ color: "#3b82f6", fontWeight: "bold", fontSize: "13px", animation: "pulse 1.5s infinite" }}>⚙️ AI is reading document...</div>
                ) : (
                  <label style={{ background: "white", color: "#0369a1", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", cursor: "pointer", display: "inline-block", fontWeight: "bold", border: "1px solid #bae6fd", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    📷 Upload Payslip
                    <input type="file" accept="image/*, .pdf" style={{ display: "none" }} onChange={handlePayslipUpload} />
                  </label>
                )}
              </div>
            )}

            <form onSubmit={saveStaff} style={{ display: "flex", flexDirection: "column", gap: "15px", maxHeight: "65vh", overflowY: "auto", paddingRight: "10px" }}>
              <h4 style={sectionHeader}>Basic Biodata</h4>
              <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} required style={inputStyle} />
              <input type="text" name="cnic" placeholder="CNIC Number" value={formData.cnic} onChange={handleInputChange} required style={inputStyle} />
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="text" name="phone" placeholder="Phone No." value={formData.phone} onChange={handleInputChange} required style={{...inputStyle, flex: 1}} />
                <select name="gender" value={formData.gender} onChange={handleInputChange} style={{...inputStyle, flex: 1}}><option value="Male">Male</option><option value="Female">Female</option></select>
              </div>
              <h4 style={sectionHeader}>Professional Details</h4>
              <input type="text" name="designation" placeholder="Designation / BPS" value={formData.designation} onChange={handleInputChange} required style={inputStyle} />
              
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="text" name="academicEdu" placeholder="Academic" value={formData.academicEdu} onChange={handleInputChange} style={{...inputStyle, flex: 1}} />
                <input type="text" name="profEdu" placeholder="Professional" value={formData.profEdu} onChange={handleInputChange} style={{...inputStyle, flex: 1}} />
              </div>
              <input type="number" name="basicSalary" placeholder="Basic Monthly Salary (Rs.)" value={formData.basicSalary} onChange={handleInputChange} required style={inputStyle} />
              <h4 style={sectionHeader}>Medical & Experience</h4>
              <textarea name="medicalInfo" placeholder="Medical history..." value={formData.medicalInfo} onChange={handleInputChange} style={{...inputStyle, minHeight: "60px"}} />
              <textarea name="pastExp" placeholder="Previous job experience..." value={formData.pastExp} onChange={handleInputChange} style={{...inputStyle, minHeight: "60px"}} />
              <h4 style={sectionHeader}>HR Records</h4>
              <textarea name="acrs" placeholder="ACR remarks..." value={formData.acrs} onChange={handleInputChange} style={{...inputStyle, minHeight: "60px"}} />
              <textarea name="punishments" placeholder="Warnings/punishments..." value={formData.punishments} onChange={handleInputChange} style={{...inputStyle, minHeight: "60px", border: "1px solid #fca5a5"}} />
              <div><label style={{ display: "block", fontSize: "12px", fontWeight: "bold", color: "#94a3b8", marginBottom: "4px" }}>{editingId ? "Update Photo" : "Staff Photo"}</label><input id="photo-upload" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)} style={{...inputStyle, fontSize: "12px", background: "#f8fafc", padding: "8px"}} /></div>
              <button type="submit" disabled={isUploading} style={{ background: isUploading ? "#94a3b8" : (editingId ? "#10b981" : "#0f172a"), color: "white", padding: "14px", border: "none", borderRadius: "12px", cursor: isUploading ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: "bold", marginTop: "10px" }}>{isUploading ? "Uploading..." : (editingId ? "Update Record" : "Save Record")}</button>
            </form>
          </div>

          {/* Directory Panel */}
          <div style={{ background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6", minHeight: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", paddingBottom: "15px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "20px" }}>Staff & HR Directory</h3>
              <input type="text" placeholder="Search staff..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: "10px 15px", width: "250px", borderRadius: "20px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", background: "#f8fafc" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {filteredStaff.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px", color: "#94a3b8" }}>No staff records found.</div>
              ) : (
                filteredStaff.map((staff) => (
                  <div key={staff.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px", borderRadius: "16px", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                    <div style={{ display: "flex", gap: "20px" }}>
                      {staff.photoUrl ? <img src={staff.photoUrl} alt={staff.fullName} style={{ width: "70px", height: "70px", borderRadius: "10px", objectFit: "cover", border: "2px solid #e2e8f0" }} /> : <div style={{ width: "70px", height: "70px", borderRadius: "10px", background: "#cbd5e1", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "20px" }}>{staff.fullName.charAt(0)}</div>}
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", fontSize: "18px", color: "#0f172a" }}>{staff.fullName} <span style={{ fontSize: "12px", background: "#e0f2fe", color: "#0369a1", padding: "2px 8px", borderRadius: "10px", marginLeft: "5px" }}>{staff.designation}</span></h4>
                        <p style={{ margin: "0 0 3px 0", fontSize: "13px", color: "#475569" }}><strong>CNIC:</strong> {staff.cnic} | <strong>Phone:</strong> {staff.phone}</p>
                        <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#475569" }}><strong>Salary:</strong> Rs. {staff.basicSalary}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                      <button onClick={() => router.push(`/staff-profile?staffId=${staff.id}`)} style={{...actionBtn, background: "#0f172a", color: "white", width: "100px"}}>Open Profile</button>
                      <button onClick={() => startEdit(staff)} style={{...actionBtn, background: "#f59e0b", color: "white", width: "100px"}}>Edit Info</button>
                      <button onClick={() => deleteStaff(staff.id)} style={{...actionBtn, background: "#ef4444", color: "white", width: "100px"}}>Terminate</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .nav-item { transition: all 0.2s; border-left: 3px solid transparent; }
        .nav-item:hover { background: #f8fafc; color: #3ea2e0 !important; cursor: pointer; border-left: 3px solid #3ea2e0; }
        .logout-btn:hover { text-decoration: underline; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}

const navSectionLabel = { fontSize: "11px", fontWeight: "bold", color: "#94a3b8", marginTop: "25px", marginBottom: "10px", paddingLeft: "10px", letterSpacing: "1px" };
const navItem = { display: "flex", alignItems: "center", padding: "12px 10px", borderRadius: "0 8px 8px 0", color: "#475569", fontSize: "14px", fontWeight: "600", marginBottom: "2px" };
const activeNavItem = { ...navItem, background: "#eff6ff", color: "#3ea2e0", borderLeft: "3px solid #3ea2e0" };
const iconPlaceholder = { width: "24px", textAlign: "center" as const, marginRight: "12px", fontSize: "18px" };
const inputStyle = { padding: "12px 15px", width: "100%", boxSizing: "border-box" as const, border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", background: "white" };
const sectionHeader = { margin: "10px 0 5px 0", color: "#3b82f6", fontSize: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "5px" };
const actionBtn = { padding: "8px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold", transition: "opacity 0.2s" };