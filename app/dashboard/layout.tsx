"use client";
import React, { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import SidebarLayout from "../components/SidebarLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false); // User is verified, show dashboard!
      } else {
        router.push("/login"); // No user, send to login
      }
    });
    return () => unsubscribe();
  }, [router]);

  // While waiting for Firebase, show a professional loading screen
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FE]">
        <h1 className="text-2xl font-bold text-[#0F172A] animate-pulse">Securing your connection...</h1>
      </div>
    );
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
