"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import SidebarLayout from "./components/SidebarLayout";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // وہ پیجز جہاں ہمیں سائیڈ بار نہیں چاہیے (Landing & Login)
  const isPublicPage = pathname === "/" || pathname === "/login";

  // سیکیورٹی چیک (Security Check)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false); // یوزر لاگ ان ہے، جانے دو
      } else {
        if (!isPublicPage) {
          router.push("/login"); // لاگ ان نہیں ہے تو لاگ ان پر بھیجو
        } else {
          setLoading(false); // پبلک پیج پر ہے تو کوئی مسئلہ نہیں
        }
      }
    });
    return () => unsubscribe();
  }, [isPublicPage, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FE]">
        <h1 className="text-2xl font-bold text-[#0F172A] animate-pulse">Loading EduPilot...</h1>
      </div>
    );
  }

  // اگر لینڈنگ پیج یا لاگ ان پیج ہے تو سائیڈ بار مت لگاؤ
  if (isPublicPage) {
    return <>{children}</>;
  }

  // باقی ہر پیج (Students, Fees, Dashboard etc) پر آٹو سائیڈ بار لگا دو!
  return <SidebarLayout>{children}</SidebarLayout>;
}
