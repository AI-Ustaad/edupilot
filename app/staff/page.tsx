"use client";
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../context/AuthContext";
import { UploadCloud, FileText } from "lucide-react";

export default function StaffPage() {
  const { user } = useAuth();
  const [schoolCategory, setSchoolCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // 1. سسٹم چیک کرے گا کہ اس ایڈمن کا سکول کون سا ہے (Government یا Private/Madrissa)
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setSchoolCategory(userDoc.data().schoolCategory);
        }
      }
    };
    fetchSchoolInfo();
  }, [user]);

  // 2. فائل اپلوڈ اور OCR سکیننگ کا فنکشن (جو آپ کے API کو ہٹ کرے گا)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // تصویر کو Base64 میں بدل کر اپنے OCR API (app/api/ocr/route.ts) پر بھیجیں
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = async () => {
        const base64Data = fileReader.result as string;

        // API کو بتائیں کہ کیا ایکسٹریکٹ کرنا ہے (Salary Slip یا CV)
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            image: base64Data,
            documentType: schoolCategory === "Government" ? "salary_slip" : "cv" 
          })
        });

        const data = await response.json();
        
        // یہاں آپ OCR سے آنے والے ڈیٹا کو اپنے فارم کی سٹیٹ (State) میں سیٹ کر سکتے ہیں
        console.log("Extracted AI Data: ", data);
        alert("Data extracted successfully! Check console.");
      };
    } catch (error) {
      console.error("OCR Extraction failed", error);
      alert("Failed to extract data. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Staff Management</h1>

      {/* --- سمارٹ AI اپلوڈ سیکشن --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center max-w-xl mx-auto">
        <div className="w-16 h-16 bg-[#e8f8f0] text-[#3ac47d] rounded-full flex items-center justify-center mb-4">
          <FileText size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-slate-800">
          {/* یوزر کے حساب سے ٹائٹل بدلے گا */}
          {schoolCategory === "Government" 
            ? "Upload Salary Slip (AI Scan)" 
            : "Upload Staff CV/Resume (AI Scan)"}
        </h2>
        
        <p className="text-sm text-slate-500 mt-2 mb-6">
          {schoolCategory === "Government"
            ? "Upload the official salary slip. Our AI will automatically extract Name, CNIC, Basic Pay, Allowances, and Deductions."
            : "Upload the candidate's CV. Our AI will extract Name, Phone, Education, and Experience automatically."}
        </p>

        <div className="relative">
          <button disabled={isUploading} className="bg-[#3ac47d] hover:bg-[#2eaa6a] text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70">
            {isUploading ? "Scanning Document..." : <><UploadCloud size={20} /> Browse File</>}
          </button>
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            onChange={handleFileUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
        </div>
      </div>
    </div>
  );
}
