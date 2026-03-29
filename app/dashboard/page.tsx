"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore"; // 🔥 Added getDocs

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // LIVE DATA STATES
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [schoolName, setSchoolName] = useState("");

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        try {
          // 1. Check if they completed Setup (Settings Page)
          const settingsSnap = await getDoc(doc(db, "users", currentUser.uid, "settings", "branding"));
          
          if (!settingsSnap.exists() || !settingsSnap.data().schoolName) {
            router.push("/settings?onboarding=true"); // Force to settings
            return;
          }

          // 2. Setup is complete! Load Live Data
          setSchoolName(settingsSnap.data().schoolName);
          
          const studentsSnap = await getDocs(collection(db, "users", currentUser.uid, "students"));
          setTotalStudents(studentsSnap.size); // Counts total students

          const staffSnap = await getDocs(collection(db, "users", currentUser.uid, "staff"));
          setTotalTeachers(staffSnap.size); // Counts total staff

          setUser(currentUser);
          setLoading(false);
        } catch (error) {
          console.error("Error loading dashboard:", error);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{ background: "#0f172a", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <div className="edu-spinner"></div>
        <h2 style={{ color: "white", fontSize: "32px", fontWeight: "900", letterSpacing: "2px", margin: "20px 0 10px 0" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h2>
        <p className="edu-pulse-text" style={{ color: "#94a3b8" }}>Verifying Secure Credentials...</p>
        <style>{`.edu-spinner { width: 50px; height: 50px; border: 4px solid rgba(62, 162, 224, 0.1); border-left-color: #3ea2e0; border-radius: 50%; animation: edu-spin 1s linear infinite; } @keyframes edu-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .edu-pulse-text { animation: edu-pulse 1.5s ease-in-out infinite; } @keyframes edu-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* 🌟 MODERN LEFT SIDEBAR */}
      <div style={{ width: "260px", background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", height: "100vh", zIndex: 100, boxShadow: "4px 0 10px rgba(0,0,0,0.02)" }}>
        
        <div style={{ padding: "0 20px", marginBottom: "30px" }}>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#0f172a", fontWeight: "900" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#10b981", fontWeight: "bold", background: "#d1fae5", padding: "3px 10px", borderRadius: "10px", display: "inline-block", letterSpacing: "1px" }}>ACTIVE WORKSPACE</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 15px" }}>
          <div style={navSectionLabel}>OVERVIEW</div>
          <div style={activeNavItem}><span style={iconPlaceholder}>📊</span> Dashboard</div>

          <div style={navSectionLabel}>ACADEMICS</div>
          <div onClick={() => router.push("/students")} className="nav-item" style={navItem}><span style={iconPlaceholder}>👨‍🎓</span> Students Profile</div>
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
      <div style={{ flex: 1, marginLeft: "260px", padding: "0" }}>
        <div style={{ background: "#e0f2fe", color: "#0369a1", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #bae6fd", fontSize: "14px" }}>
          <span><strong>Welcome to {schoolName}</strong> — You are viewing the active workspace.</span>
        </div>

        <div style={{ padding: "40px", maxWidth: "1400px", margin: "0 auto" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px" }}>
            <div>
              <h2 style={{ margin: "0 0 5px 0", fontSize: "28px", color: "#0f172a", fontWeight: "900" }}>{greeting}!</h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "15px" }}>{dateString}</p>
            </div>
          </div>

          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "15px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px", color: "#166534" }}>
            <span style={{ fontSize: "20px" }}>✓</span>
            <span style={{ fontWeight: "bold" }}>System Online.</span> Welcome to your central command center.
          </div>

          {/* 🔥 LIVE METRICS ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            <div className="hover-lift" style={metricCard}>
              <p style={metricTitle}>Total Students</p>
              <h3 style={metricValue}>{totalStudents}</h3>
            </div>
            <div className="hover-lift" style={metricCard}>
              <p style={metricTitle}>Total Teachers</p>
              <h3 style={metricValue}>{totalTeachers}</h3>
            </div>
            <div className="hover-lift" style={metricCard}>
              <p style={metricTitle}>Attendance Rate</p>
              <h3 style={{...metricValue, color: "#10b981"}}>94%</h3>
            </div>
            <div className="hover-lift" style={metricCard}>
              <p style={metricTitle}>Fee Collection</p>
              <h3 style={{...metricValue, color: "#3ea2e0"}}>81%</h3>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div style={{ marginBottom: "30px" }}>
            <h3 style={sectionTitle}>QUICK ACTIONS</h3>
            <div style={{ display: "flex", gap: "15px" }}>
              <div onClick={() => router.push("/attendance")} className="quick-action" style={quickActionCard}><div style={qaIcon}>📅</div>Mark Attendance</div>
              <div onClick={() => router.push("/result")} className="quick-action" style={quickActionCard}><div style={qaIcon}>📄</div>Enter Results</div>
              <div onClick={() => router.push("/students")} className="quick-action" style={quickActionCard}><div style={qaIcon}>➕</div>Add Student</div>
              <div onClick={() => router.push("/fees")} className="quick-action" style={quickActionCard}><div style={qaIcon}>💰</div>Generate Fee Slip</div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .nav-item { transition: all 0.2s; border-left: 3px solid transparent; }
        .nav-item:hover { background: #f8fafc; color: #3ea2e0 !important; cursor: pointer; border-left: 3px solid #3ea2e0; }
        .quick-action { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
        .quick-action:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-color: #3ea2e0; }
        .hover-lift { transition: transform 0.2s; }
        .hover-lift:hover { transform: translateY(-3px); }
        .logout-btn:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}

const navSectionLabel = { fontSize: "11px", fontWeight: "bold", color: "#94a3b8", marginTop: "25px", marginBottom: "10px", paddingLeft: "10px", letterSpacing: "1px" };
const navItem = { display: "flex", alignItems: "center", padding: "12px 10px", borderRadius: "0 8px 8px 0", color: "#475569", fontSize: "14px", fontWeight: "600", marginBottom: "2px" };
const activeNavItem = { ...navItem, background: "#eff6ff", color: "#3ea2e0", borderLeft: "3px solid #3ea2e0" };
const iconPlaceholder = { width: "24px", textAlign: "center" as const, marginRight: "12px", fontSize: "18px" };
const metricCard = { background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" };
const metricTitle = { margin: "0 0 5px 0", fontSize: "13px", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" as const };
const metricValue = { margin: 0, fontSize: "32px", color: "#0f172a", fontWeight: "900" };
const sectionTitle = { margin: "0 0 15px 0", fontSize: "12px", color: "#94a3b8", fontWeight: "bold", letterSpacing: "1px" };
const quickActionCard = { background: "white", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: "10px", flex: 1, fontSize: "14px", fontWeight: "bold", color: "#334155" };
const qaIcon = { width: "45px", height: "45px", borderRadius: "12px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", border: "1px solid #e2e8f0" };