"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import SidebarLayout from "@/app/components/SidebarLayout";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Landing page or Login page
  const isPublicPage = pathname === "/" || pathname === "/login";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(false); 
      } else {
        if (!isPublicPage) {
          router.push("/login"); 
        } else {
          setLoading(false); 
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

  if (isPublicPage) {
    return <>{children}</>;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
