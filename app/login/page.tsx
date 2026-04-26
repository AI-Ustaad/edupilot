import React from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* ہم نے اصل فارم کو یہاں بلایا ہے */}
      <LoginForm />
    </div>
  );
}
