import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login | EduPilot",
  description: "Sign in to your EduPilot Dashboard",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-center overflow-hidden font-sans selection:bg-pink-100">
      
      {/* 🚀 EXACT TECHFLOW WAVE GRADIENT */}
      <style dangerouslySetInnerHTML={{__html: `
        .techflow-wave-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at 15% 50%, rgba(255, 107, 158, 0.3) 0%, transparent 40%),
                      radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 50% 80%, rgba(255, 200, 0, 0.3) 0%, transparent 40%);
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
        }
        .techflow-shadow {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 15px rgba(0,0,0,0.03);
        }
        .text-super-tight {
          letter-spacing: -0.04em;
        }
      `}} />

      {/* Background Layer */}
      <div className="techflow-wave-bg"></div>

      {/* Login Container */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[420px] px-6 lg:px-0">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-6 hover:scale-105 transition-transform">
            <div className="w-8 h-8 bg-[#111] rounded-[6px] flex items-center justify-center shadow-lg">
               <div className="w-3.5 h-3.5 bg-white rounded-[2px] transform rotate-45"></div>
            </div>
            <span className="font-black text-2xl tracking-tight text-[#111]">EduPilot</span>
          </Link>
          <h2 className="text-center text-[2rem] font-black text-[#111] text-super-tight leading-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-[15px] text-[#555] font-medium">
            Sign in to access your administrative dashboard
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-2xl py-8 px-6 sm:px-10 border border-white/60 rounded-2xl techflow-shadow">
          
          {/* Client Component for Logic */}
          <LoginForm />

          {/* Footer inside card */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-center">
               <div className="flex items-center gap-2 text-[#0b0b0b] bg-gray-50/80 px-4 py-2.5 rounded-lg border border-gray-200">
                  <ShieldCheck size={16} className="text-green-600" />
                  <span className="font-bold text-[10px] uppercase tracking-widest text-[#555]">Enterprise Secure Login</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
