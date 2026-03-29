"use client";
import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] flex flex-col items-center justify-center">
      <h1 className="text-6xl font-black text-[#302B52]">EduPilot</h1>
      <Link href="/login" className="mt-8 bg-[#7166F9] text-white px-8 py-4 rounded-xl font-bold">
        Login to Dashboard
      </Link>
    </div>
  );
}
