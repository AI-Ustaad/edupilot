import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/auth-server";
import { isSubscriptionValid } from "@/lib/subscription";
import SidebarLayout from "@/components/SidebarLayout";
import ParticleBackground from "@/components/ParticleBackground";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (user.onboardingRequired === true || !user.tenantId) {
    redirect("/onboarding");
  }

  const { valid, message } = await isSubscriptionValid(user.tenantId);
  if (!valid) {
    const url = new URL("/settings/billing", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
    url.searchParams.set("error", message || "Subscription inactive");
    redirect(url.toString());
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ===== بیک گراؤنڈ وال پیپر (80% شفاف) ===== */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(4px) brightness(1.1)",
          opacity: 0.2,   // 20% visible → 80% شفافیت
        }}
      />

      {/* ===== محیطی چمک (آربز) ===== */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[150px]" />
      </div>

      {/* ===== فلورا / کورل امیجز (اگر موجود ہوں) ===== */}
      {/* اگر آپ نے یہ تصاویر اپ لوڈ کی ہیں تو راستے درست کر کے ان کو غیر مخفی کر سکتے ہیں */}
      {/* <img src="/assets/flora-1.png" alt="" className="fixed pointer-events-none z-0 opacity-20" ... /> */}

      {/* ===== تیرتے ہوئے ذرات (پارٹیکلز) ===== */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <ParticleBackground />
      </div>

      {/* ===== اصلی مواد ===== */}
      <div className="relative z-10">
        <SidebarLayout>{children}</SidebarLayout>
      </div>
    </div>
  );
}
