import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/auth-server";
import { isSubscriptionValid } from "@/lib/subscription";
import SidebarLayout from "@/components/SidebarLayout";
import ParticleBackground from "@/components/ParticleBackground";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.onboardingRequired === true || !user.tenantId) redirect("/onboarding");

  const { valid, message } = await isSubscriptionValid(user.tenantId);
  if (!valid) {
    const url = new URL("/settings/billing", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
    url.searchParams.set("error", message || "Subscription inactive");
    redirect(url.toString());
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-dark-900">
      {/* Volumetric light rays */}
      <div className="volumetric-rays"></div>

      {/* Ambient glow orbs */}
      <div className="ambient-glow-orb orb-1"></div>
      <div className="ambient-glow-orb orb-2"></div>
      <div className="ambient-glow-orb orb-3"></div>

      {/* Floating particles */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <ParticleBackground />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <SidebarLayout>{children}</SidebarLayout>
      </div>
    </div>
  );
}
