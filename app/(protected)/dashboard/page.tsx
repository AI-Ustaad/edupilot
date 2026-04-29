import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";

export default async function DashboardPage() {
  const session = cookies().get("session")?.value;

  if (!session) {
    redirect("/login");
  }

  try {
    await adminAuth.verifySessionCookie(session, true);
  } catch {
    redirect("/login");
  }

  return <div>Dashboard (Protected)</div>;
}
