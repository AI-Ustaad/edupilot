"use client";

import { useRouter, usePathname } from "next/navigation";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Helper function to build beautiful, auto-highlighting nav items
  const navItem = (path: string, icon: string, label: string) => {
    const isActive = pathname === path || pathname.startsWith(path + "/");
    return (
      <div 
        onClick={() => router.push(path)} 
        style={{
          display: "flex", alignItems: "center", padding: "10px", borderRadius: "8px", 
          color: isActive ? "#3ea2e0" : "#475569", 
          background: isActive ? "#eff6ff" : "transparent",
          fontSize: "14px", fontWeight: "600", marginBottom: "2px", cursor: "pointer",
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => !isActive && (e.currentTarget.style.background = "#f8fafc")}
        onMouseOut={(e) => !isActive && (e.currentTarget.style.background = "transparent")}
      >
        <span style={{ width: "24px", textAlign: "center", marginRight: "10px", fontSize: "16px" }}>{icon}</span> 
        {label}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* ========================================== */}
      {/* 🌟 PERSISTENT LEFT SIDEBAR                 */}
      {/* ========================================== */}
      <div style={{ width: "260px", background: "white", borderRight: "1px solid #e2e8f0", display: "flex", flexDirection: "column", padding: "20px 0", position: "fixed", height: "100vh", zIndex: 100 }}>
        
        {/* Sidebar Header */}
        <div style={{ padding: "0 20px", marginBottom: "30px", cursor: "pointer" }} onClick={() => router.push("/dashboard")}>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#0f172a", fontWeight: "900" }}>EduPilot<span style={{ color: "#3ea2e0" }}>.</span></h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#f59e0b", fontWeight: "bold", background: "#fef3c7", padding: "2px 8px", borderRadius: "10px", display: "inline-block" }}>DEMO WORKSPACE</p>
        </div>

        {/* Navigation Links */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 15px" }}>
          
          <div style={navSectionLabel}>OVERVIEW</div>
          {navItem("/dashboard", "🏠", "Dashboard")}

          <div style={navSectionLabel}>ACADEMICS</div>
          {navItem("/students", "👨‍🎓", "Students")}
          {navItem("/attendance", "⏱️", "Attendance")}
          {navItem("/result", "📄", "Results")}

          <div style={navSectionLabel}>FINANCE</div>
          {navItem("/fees", "💰", "Fees")}
          {navItem("/expenses", "📉", "Expenses")}

          <div style={navSectionLabel}>STAFF & OPS</div>
          {navItem("/staff", "🧑‍🏫", "Teachers & HR")}
          {navItem("/schedule", "🗓️", "Schedule")}

          <div style={navSectionLabel}>AI & SETTINGS</div>
          {navItem("/settings", "⚙️", "Settings")}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: "20px", borderTop: "1px solid #e2e8f0", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: "#3ea2e0", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: "#0f172a" }}>{user?.displayName || "Admin User"}</p>
              <p onClick={handleLogout} style={{ margin: 0, fontSize: "12px", color: "#ef4444", cursor: "pointer", fontWeight: "bold" }}>Logout</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🌟 DYNAMIC MAIN CONTENT AREA               */}
      {/* ========================================== */}
      <div style={{ flex: 1, marginLeft: "260px", padding: "0" }}>
        
        {/* Persistent Top Notification Bar */}
        <div style={{ background: "#e0f2fe", color: "#0369a1", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #bae6fd", fontSize: "14px" }}>
          <span><strong>Welcome to EduPilot</strong> — You are viewing the demo workspace.</span>
          <span style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>عید مبارک! ہمارے پلیٹ فارم کو ٹیسٹ کرنے والے پہلے دوستوں میں شامل ہیں</span>
        </div>

        {/* The child page content automatically injects here! */}
        <div style={{ padding: "30px 40px", maxWidth: "1400px", margin: "0 auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Sidebar Label Styling
const navSectionLabel = { fontSize: "11px", fontWeight: "bold", color: "#94a3b8", marginTop: "20px", marginBottom: "10px", paddingLeft: "10px" };