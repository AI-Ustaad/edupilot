import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import SidebarLayout from "../components/SidebarLayout"; 

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = cookies().get("session")?.value;

  if (!session) {
    console.log("❌ No session cookie");
    redirect("/login");
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    console.log("✅ SESSION OK:", decoded.uid);
    return <SidebarLayout>{children}</SidebarLayout>;
  } catch (error) {
    console.error("❌ SESSION FAILED:", error);
    redirect("/login");
  }
}