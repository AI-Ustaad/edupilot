import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/auth-server";
import { isSubscriptionValid } from "@/lib/subscription";
import SidebarLayout from "@/components/SidebarLayout";
import { ClientAuthWrapper } from "@/components/ClientAuthWrapper";

import QueryProvider from "@/components/QueryProvider";
import { BrandingProvider } from "@/context/BrandingContext";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) redirect("/login");

  if (user.onboardingRequired || !user.tenantId) {
    redirect("/onboarding");
  }

  const { valid, message } = await isSubscriptionValid(user.tenantId);

  if (!valid) {
    redirect(
      `/settings/billing?error=${encodeURIComponent(
        message || "Subscription inactive"
      )}`
    );
  }

  return (
    <ClientAuthWrapper>
      <QueryProvider>
        <BrandingProvider>
          <div className="min-h-screen bg-slate-50">
            <SidebarLayout>{children}</SidebarLayout>
          </div>
        </BrandingProvider>
      </QueryProvider>
    </ClientAuthWrapper>
  );
}
