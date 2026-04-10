"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Branding States
  const [schoolCategory, setSchoolCategory] = useState("Private School");
  const [schoolName, setSchoolName] = useState("");
  const [tagline, setTagline] = useState("");
  const [principalName, setPrincipalName] = useState("");
  
  // Logo States
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        await loadSettings(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadSettings = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid, "settings", "branding");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSchoolCategory(data.schoolCategory || "Private School");
        setSchoolName(data.schoolName || "");
        setTagline(data.tagline || "");
        setPrincipalName(data.principalName || "");
        setExistingLogoUrl(data.logoUrl || "");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadLogoToCloudinary = async (file: File) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "edupilot_preset"); 
    data.append("cloud_name", "dnnp0uut5"); 

    const res = await fetch("https://api.cloudinary.com/v1_1/dnnp0uut5/image/upload", {
      method: "POST",
      body: data,
    });
    const uploadedImage = await res.json();
    return uploadedImage.secure_url;
  };

  const handleCategoryChange = (e: any) => {
    const category = e.target.value;
    setSchoolCategory(category);
    // Auto-fill tagline for Government Schools
    if (category === "Government School") {
      setTagline("سرکاری سکول معیاری سکول");
    } else if (tagline === "سرکاری سکول معیاری سکول") {
      setTagline(""); // Clear it if they switch back to private
    }
  };

  const saveSettings = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsSaving(true);
      let finalLogoUrl = existingLogoUrl;

      if (logoFile) {
        finalLogoUrl = await uploadLogoToCloudinary(logoFile);
      }

      await setDoc(doc(db, "users", user.uid, "settings", "branding"), {
        schoolCategory,
        schoolName,
        tagline,
        principalName,
        logoUrl: finalLogoUrl,
        updatedAt: new Date()
      });

      setExistingLogoUrl(finalLogoUrl);
      setLogoFile(null);
      
      const fileInput = document.getElementById("logo-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      alert("School Branding Saved Successfully!");
    } catch (error: any) {
      alert("Save Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>Loading Settings...</div>;

  return (
    <div style={{ padding: "30px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
      
      <div style={{ background: "#0a192f", padding: "20px", borderRadius: "8px", color: "white", marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>School Setup & Branding</h2>
        <button onClick={() => router.push("/students")} style={{ background: "#475569", color: "white", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer" }}>
          Back to Dashboard
        </button>
      </div>

      <div style={{ background: "white", padding: "30px", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <p style={{ color: "#64748b", marginBottom: "25px" }}>
          Configure your school's identity here. These details will automatically appear on all official documents, including Student Result Cards and Fee Slips.
        </p>

        <form onSubmit={saveSettings} style={{ display: "grid", gap: "20px" }}>
          
          <div>
            <label style={labelStyle}>School Category</label>
            <select value={schoolCategory} onChange={handleCategoryChange} style={inputStyle}>
              <option value="Private School">Private School</option>
              <option value="Government School">Government School</option>
              <option value="Madrissa">Madrissa</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>School Name</label>
            <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Allied Public School" required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Tagline or Subtitle (Optional)</label>
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. A Project of Education Foundation" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Principal / Head Name</label>
            <input type="text" value={principalName} onChange={(e) => setPrincipalName(e.target.value)} placeholder="e.g. Imran Haider Sandhu" required style={inputStyle} />
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px", marginTop: "10px" }}>
            <label style={labelStyle}>School Logo</label>
            
            {existingLogoUrl && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 5px 0" }}>Current Logo:</p>
                <img src={existingLogoUrl} alt="School Logo" style={{ height: "80px", objectFit: "contain", background: "#f8fafc", padding: "5px", border: "1px solid #e2e8f0", borderRadius: "5px" }} />
              </div>
            )}

            <input id="logo-upload" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)} style={inputStyle} />
          </div>

          <button type="submit" disabled={isSaving} style={{ background: isSaving ? "#94a3b8" : "#3b82f6", color: "white", padding: "15px", border: "none", borderRadius: "5px", cursor: isSaving ? "not-allowed" : "pointer", fontSize: "16px", fontWeight: "bold", marginTop: "10px" }}>
            {isSaving ? "Saving Branding..." : "Save School Branding"}
          </button>

        </form>
      </div>
    </div>
  );
}

const inputStyle = { padding: "12px", width: "100%", boxSizing: "border-box" as const, border: "1px solid #cbd5e1", borderRadius: "5px", fontSize: "15px", outline: "none" };
const labelStyle = { display: "block", fontSize: "14px", fontWeight: "bold", color: "#334155", marginBottom: "8px" };
