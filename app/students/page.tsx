"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function Students() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 UPGRADED STATE: All new fields included
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", fatherName: "", motherName: "",
    bForm: "", fatherCnic: "", motherCnic: "", guardianContact: "",
    admissionNo: "", address: "", prevSchool: "", 
    studentClass: "", section: "", dob: "", gender: "Male", photoUrl: ""
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/login");
      else {
        setUser(currentUser);
        fetchStudents(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchStudents = async (uid: string) => {
    try {
      const snapshot = await getDocs(collection(db, "users", uid, "students"));
      const data: any[] = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setStudents(data);
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const uploadPhotoToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "edupilot_preset"); 
    data.append("cloud_name", "dnnp0uut5"); 
    const res = await fetch("https://api.cloudinary.com/v1_1/dnnp0uut5/image/upload", { method: "POST", body: data });
    const uploadedImage = await res.json();
    return uploadedImage.secure_url;
  };

  const saveStudent = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    try {
      setIsUploading(true);
      const studentData: any = { ...formData };
      
      // Save Full Name for easier searching/compatibility with older code
      studentData.fullName = `${formData.firstName} ${formData.lastName}`.trim();

      if (photo) studentData.photoUrl = await uploadPhotoToCloudinary(photo);
      
      if (editingId) await updateDoc(doc(db, "users", user.uid, "students", editingId), studentData);
      else {
        studentData.addedAt = new Date();
        await addDoc(collection(db, "users", user.uid, "students"), studentData);
      }
      
      // Reset Form
      setFormData({
        firstName: "", lastName: "", fatherName: "", motherName: "", bForm: "", fatherCnic: "", motherCnic: "", guardianContact: "", admissionNo: "", address: "", prevSchool: "", studentClass: "", section: "", dob: "", gender: "Male", photoUrl: ""
      });
      setPhoto(null); setEditingId(null);
      const fileInput = document.getElementById("photo-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchStudents(user.uid);
    } catch (error: any) {
      alert("Save Error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const startEdit = (student: any) => {
    setFormData({
      firstName: student.firstName || "", lastName: student.lastName || "",
      fatherName: student.fatherName || "", motherName: student.motherName || "",
      bForm: student.bForm || "", fatherCnic: student.fatherCnic || "",
      motherCnic: student.motherCnic || "", guardianContact: student.guardianContact || "",
      admissionNo: student.admissionNo || "", address: student.address || "",
      prevSchool: student.prevSchool || "", studentClass: student.studentClass || "",
      section: student.section || "", dob: student.dob || "", gender: student.gender || "Male", photoUrl: student.photoUrl || ""
    });
    setEditingId(student.id);
  };

  const deleteStudent = async (id: string) => {
    if (window.confirm("Delete this student profile?")) {
      await deleteDoc(doc(db, "users", user.uid, "students", id));
      fetchStudents(user.uid);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Improved Search Logic
  const filteredStudents = students.filter(s => {
    const searchStr = searchQuery.toLowerCase();
    return (s.firstName?.toLowerCase().includes(searchStr) || s.lastName?.toLowerCase().includes(searchStr) || s.admissionNo?.includes(searchStr) || s.studentClass?.toLowerCase().includes(searchStr));
  });

  if (loading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="edu-spinner"></div><h2 style={{ color: "white", fontSize: "32px", fontWeight: "900", letterSpacing: "2px", margin: "20px 0 10px 0" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h2><p className="edu-pulse-text" style={{ color: "#94a3b8" }}>Loading Student Directory...</p>
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
          <div style={activeNavItem}><span style={iconPlaceholder}>👨‍🎓</span> Students Profile</div>
          <div onClick={() => router.push("/attendance")} className="nav-item" style={navItem}><span style={iconPlaceholder}>⏱️</span> Daily Attendance</div>
          <div onClick={() => router.push("/result")} className="nav-item" style={navItem}><span style={iconPlaceholder}>📄</span> Term Results</div>

          <div style={navSectionLabel}>FINANCE</div>
          <div onClick={() => router.push("/fees")} className="nav-item" style={navItem}><span style={iconPlaceholder}>💰</span> Fee Management</div>

          <div style={navSectionLabel}>STAFF & OPS</div>
          <div onClick={() => router.push("/staff")} className="nav-item" style={navItem}><span style={iconPlaceholder}>🧑‍🏫</span> HR & Teachers</div>

          <div style={navSectionLabel}>SYSTEM</div>
          <div onClick={() => router.push("/settings")} className="nav-item" style={navItem}><span style={iconPlaceholder}>⚙️</span> School Settings</div>
        </div>

        <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", marginTop: "auto", background: "#f8fafc" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px" }}>
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>System Admin</p>
              <p onClick={handleLogout} className="logout-btn" style={{ margin: 0, fontSize: "12px", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Logout Securely</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MAIN CONTENT AREA */}
      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", maxWidth: "1400px", margin: "0 auto", alignItems: "start" }}>
          
          {/* ======================= REGISTRATION FORM ======================= */}
          <div style={{ background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6" }}>
            <div style={{ marginBottom: "25px", borderBottom: "2px solid #f1f5f9", paddingBottom: "15px" }}>
              <h2 style={{ margin: "0 0 5px 0", color: "#0f172a", fontSize: "22px" }}>{editingId ? "Edit Student Record" : "Register New Student"}</h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#ef4444", fontWeight: "bold" }}>Fields marked with * are strictly mandatory.</p>
            </div>
            
            <form onSubmit={saveStudent} style={{ display: "flex", flexDirection: "column", gap: "20px", maxHeight: "65vh", overflowY: "auto", paddingRight: "10px" }}>
              
              {/* Personal Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div><label style={labelStyle}>First Name *</label><input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Last Name *</label><input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required style={inputStyle} /></div>
              </div>

              {/* Parents & Legal Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", background: "#f8fafc", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div><label style={labelStyle}>Father's Name *</label><input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Mother's Name *</label><input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} required style={inputStyle} /></div>
                
                <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>B-Form Number *</label><input type="text" name="bForm" placeholder="xxxxx-xxxxxxx-x" value={formData.bForm} onChange={handleInputChange} required style={inputStyle} /></div>
                
                <div><label style={labelStyle}>Father CNIC *</label><input type="text" name="fatherCnic" placeholder="xxxxx-xxxxxxx-x" value={formData.fatherCnic} onChange={handleInputChange} required style={inputStyle} /></div>
                <div><label style={labelStyle}>Mother CNIC *</label><input type="text" name="motherCnic" placeholder="xxxxx-xxxxxxx-x" value={formData.motherCnic} onChange={handleInputChange} required style={inputStyle} /></div>
                
                <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Guardian Contact No. *</label><input type="tel" name="guardianContact" placeholder="03xx-xxxxxxx" value={formData.guardianContact} onChange={handleInputChange} required style={inputStyle} /></div>
              </div>

              {/* Academic & Address Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div><label style={labelStyle}>Class</label><input type="text" name="studentClass" value={formData.studentClass} onChange={handleInputChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>Section</label><input type="text" name="section" value={formData.section} onChange={handleInputChange} style={inputStyle} /></div>
                
                <div><label style={labelStyle}>Admission No.</label><input type="text" name="admissionNo" value={formData.admissionNo} onChange={handleInputChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>Previous School Name</label><input type="text" name="prevSchool" value={formData.prevSchool} onChange={handleInputChange} style={inputStyle} /></div>
                
                <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Complete Address</label><input type="text" name="address" value={formData.address} onChange={handleInputChange} style={inputStyle} /></div>
              </div>

              {/* Bio & Photo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div><label style={labelStyle}>Date of Birth</label><input type="date" name="dob" value={formData.dob} onChange={handleInputChange} style={inputStyle} /></div>
                <div><label style={labelStyle}>Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} style={inputStyle}><option value="Male">Male</option><option value="Female">Female</option></select></div>
              </div>

              <div>
                 <label style={labelStyle}>{editingId ? "Update Photo (Optional)" : "Upload Passport Photo"}</label>
                 <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)} style={{...inputStyle, fontSize: "12px", background: "#f8fafc", padding: "8px"}} />
              </div>

              <button type="submit" disabled={isUploading} style={{ background: isUploading ? "#94a3b8" : (editingId ? "#10b981" : "#0f172a"), color: "white", padding: "16px", border: "none", borderRadius: "12px", cursor: isUploading ? "not-allowed" : "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "10px", transition: "all 0.2s" }}>
                {isUploading ? "Processing..." : (editingId ? "Update Record" : "💾 Save Secure Record")}
              </button>
              {editingId && <button type="button" onClick={() => {setEditingId(null); setPhoto(null); setFormData({ firstName: "", lastName: "", fatherName: "", motherName: "", bForm: "", fatherCnic: "", motherCnic: "", guardianContact: "", admissionNo: "", address: "", prevSchool: "", studentClass: "", section: "", dob: "", gender: "Male", photoUrl: "" })}} style={{ background: "transparent", color: "#ef4444", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>Cancel Editing</button>}
            </form>
          </div>

          {/* ======================= DIRECTORY & LIST ======================= */}
          <div style={{ background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6", minHeight: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", paddingBottom: "15px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, color: "#0f172a", fontSize: "20px" }}>Enrolled Students</h3>
              <input type="text" placeholder="Search by name, class, or adm no..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: "10px 15px", width: "250px", borderRadius: "20px", border: "1px solid #e2e8f0", outline: "none", fontSize: "14px", background: "#f8fafc" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "70vh", overflowY: "auto", paddingRight: "5px" }}>
              {filteredStudents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px", color: "#94a3b8" }}>No students found.</div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", borderRadius: "16px", border: "1px solid #f1f5f9", transition: "all 0.2s" }} onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseOut={(e) => e.currentTarget.style.background = "white"}>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      {student.photoUrl ? (
                        <img src={student.photoUrl} alt="Photo" style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }} />
                      ) : (
                        <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#0f172a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "16px" }}>{student.firstName ? student.firstName.charAt(0) : "?"}</div>
                      )}
                      
                      <div>
                        {/* Notice how missing data automatically outputs "N/A" here */}
                        <h4 style={{ margin: "0 0 3px 0", fontSize: "16px", color: "#0f172a", fontWeight: "bold" }}>{student.firstName || "N/A"} {student.lastName || ""}</h4>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                          Class: <strong>{student.studentClass || "N/A"}</strong> | Sec: <strong>{student.section || "N/A"}</strong> | Adm: <strong>{student.admissionNo || "N/A"}</strong>
                        </p>
                        <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#94a3b8" }}>
                          Guardian No: {student.guardianContact || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => router.push(`/student-profile?studentId=${student.id}`)} style={{...actionBtn, background: "#0f172a", color: "white", width: "auto", padding: "0 15px"}} title="Open Full Profile">Profile</button>
                      <button onClick={() => startEdit(student)} style={{...actionBtn, background: "#f1f5f9", color: "#f59e0b"}} title="Edit Details">✏️</button>
                      <button onClick={() => deleteStudent(student.id)} style={{...actionBtn, background: "#fef2f2", color: "#ef4444"}} title="Delete">🗑️</button>
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
      `}</style>
    </div>
  );
}

// Inline Styles
const navSectionLabel = { fontSize: "11px", fontWeight: "bold", color: "#94a3b8", marginTop: "25px", marginBottom: "10px", paddingLeft: "10px", letterSpacing: "1px" };
const navItem = { display: "flex", alignItems: "center", padding: "12px 10px", borderRadius: "0 8px 8px 0", color: "#475569", fontSize: "14px", fontWeight: "600", marginBottom: "2px" };
const activeNavItem = { ...navItem, background: "#eff6ff", color: "#3ea2e0", borderLeft: "3px solid #3ea2e0" };
const iconPlaceholder = { width: "24px", textAlign: "center" as const, marginRight: "12px", fontSize: "18px" };

const inputStyle = { padding: "12px 15px", width: "100%", boxSizing: "border-box" as const, border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", background: "#f8fafc", transition: "border-color 0.2s" };
const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", color: "#64748b", marginBottom: "4px" };
const actionBtn = { height: "35px", borderRadius: "8px", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "14px", transition: "transform 0.1s" };
