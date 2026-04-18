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
    <div className="relative min-h-screen bg-[#ffffff] flex flex-col justify-center overflow-hidden font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        .techflow-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; background: #ffffff; overflow: hidden; }
        .techflow-wave {
          position: absolute; top: 10%; left: 50%; transform: translateX(-50%); width: 120vw; height: 100vh;
          background-image: radial-gradient(ellipse at 80% 20%, rgba(66, 209, 245, 0.45) 0%, transparent 40%),
                            radial-gradient(ellipse at 50% 50%, rgba(255, 230, 109, 0.55) 0%, transparent 40%),
                            radial-gradient(ellipse at 20% 80%, rgba(255, 107, 139, 0.5) 0%, transparent 50%);
          filter: blur(70px); opacity: 0.9;
        }
        .techflow-shadow { box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.1), 0 0 20px rgba(0,0,0,0.02); }
        .text-super-tight { letter-spacing: -0.04em; }
      `}} />

      <div className="techflow-bg"><div className="techflow-wave"></div></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[440px] px-6 lg:px-0">
        
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="flex items-center gap-2.5 mb-8 hover:scale-105 transition-transform">
            <div className="w-8 h-8 bg-[#0b0b0b] rounded-[6px] flex items-center justify-center shadow-lg">
               <div className="w-3.5 h-3.5 bg-white rounded-[2px] transform rotate-45"></div>
            </div>
            <span className="font-black text-[22px] tracking-tight text-[#0b0b0b]">EduPilot</span>
          </Link>
          <h2 className="text-center text-[2.5rem] font-black text-[#0b0b0b] text-super-tight leading-tight">
            Welcome back
          </h2>
          <p className="mt-3 text-center text-[16px] text-[#555] font-medium">
            Sign in to access your administrative dashboard
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-2xl py-10 px-6 sm:px-10 border border-white/60 rounded-[20px] techflow-shadow">
          <LoginForm />
          <div className="mt-8 pt-6 border-t border-gray-100/80">
            <div className="flex justify-center">
               <div className="flex items-center gap-2 text-[#0b0b0b] bg-gray-50/80 px-4 py-2.5 rounded-lg border border-gray-100">
                  <ShieldCheck size={18} className="text-green-500" />
                  <span className="font-bold text-[11px] uppercase tracking-widest text-[#555]">Enterprise Secure Login</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
