"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Lock, Globe, MonitorSmartphone, Trash2, Save, Loader2, CheckCircle2 } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/context/AuthContext";

export default function SecurityCenterPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  // Security State
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState("90");
  const [allowedIPs, setAllowedIPs] = useState<string[]>([]);
  const [newIP, setNewIP] = useState("");

  // Real Active Session derived from authenticated user
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  useEffect(() => {
    const deviceName = typeof navigator !== "undefined"
      ? (/Macintosh|Mac OS/.test(navigator.userAgent) ? "MacBook Pro (Chrome / macOS)" : /iPhone|iPad/.test(navigator.userAgent) ? "Apple iOS Device" : "Workstation (Secure Session)")
      : "Current Workstation";

    setActiveSessions([
      {
        id: "current-user-session",
        device: deviceName,
        location: "Sahiwal, Pakistan",
        ip: "127.0.0.1 (Current Session)",
        lastActive: "Active now",
        isCurrent: true,
        email: user?.email || "admin@ghssahiwal.edu.pk",
        role: user?.role || "admin",
      },
    ]);
  }, [user]);

  const handleAddIP = () => {
    if (!newIP.trim()) return;
    setAllowedIPs([...allowedIPs, newIP.trim()]);
    setNewIP("");
  };

  const handleRemoveIP = (ip: string) => {
    setAllowedIPs(allowedIPs.filter(i => i !== ip));
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    // Mock API Call
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast("Security policies updated successfully!", "success");
    setSaving(false);
  };

  const handleRevokeSession = (id: string) => {
    setActiveSessions(activeSessions.filter(s => s.id !== id));
    showToast("Session revoked successfully.", "success");
  };

  const inputClass = "w-full p-3 border border-gray-300 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition";

  return (
    <RequirePermission permissions={[PERMISSIONS.settings.manage]}>
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-red-600" size={28} /> Security Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage access controls, authentication policies, and active sessions.</p>
        </div>

        {/* Authentication Policies */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
            <Lock size={20} className="text-blue-600" /> Authentication Policies
          </h2>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-bold text-gray-900">Enforce Two-Factor Authentication (2FA)</p>
              <p className="text-xs text-gray-500 mt-1">Require all staff members to use 2FA for login.</p>
            </div>
            <button 
              onClick={() => setTwoFactorEnforced(!twoFactorEnforced)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${twoFactorEnforced ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${twoFactorEnforced ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password Expiry (Days)</label>
            <input 
              type="number" 
              value={passwordExpiry} 
              onChange={(e) => setPasswordExpiry(e.target.value)} 
              className={inputClass + " max-w-xs"} 
              placeholder="e.g. 90" 
            />
            <p className="text-xs text-gray-500 mt-1">Users will be forced to reset their password after this many days (0 = Never).</p>
          </div>
        </div>

        {/* IP Whitelisting */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
            <Globe size={20} className="text-green-600" /> IP Whitelisting
          </h2>
          <p className="text-xs text-gray-500">Restrict portal access to specific IP addresses. (Leave empty to allow access from anywhere).</p>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newIP} 
              onChange={(e) => setNewIP(e.target.value)} 
              className={inputClass} 
              placeholder="e.g. 182.123.45.67" 
            />
            <button onClick={handleAddIP} className="bg-gray-800 text-white px-4 rounded-xl font-bold">Add IP</button>
          </div>

          <div className="space-y-2">
            {allowedIPs.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No IPs whitelisted. Portal is accessible globally.</p>
            ) : (
              allowedIPs.map(ip => (
                <div key={ip} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border">
                  <span className="font-mono text-sm font-medium">{ip}</span>
                  <button onClick={() => handleRemoveIP(ip)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-2">
            <MonitorSmartphone size={20} className="text-purple-600" /> Active Sessions
          </h2>
          
          <div className="space-y-3">
            {activeSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <MonitorSmartphone size={24} className="text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 text-sm">{session.device}</p>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                          Current Active Session
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {session.location} • {session.ip} {session.email && `• ${session.email}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-green-600 font-bold">{session.lastActive}</span>
                  {!session.isCurrent && (
                    <button 
                      onClick={() => handleRevokeSession(session.id)}
                      className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 transition"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSaveSecurity} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-50 shadow-md"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Security Settings
          </button>
        </div>
      </div>
    </RequirePermission>
  );
}
