import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/auth-server";
import { isSubscriptionValid } from "@/lib/subscription";
import SidebarLayout from "@/components/SidebarLayout";

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
    <div className="min-h-screen bg-slate-50">
      <SidebarLayout>{children}</SidebarLayout>
    </div>
  );
}
