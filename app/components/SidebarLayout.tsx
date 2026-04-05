// app/components/SidebarLayout.tsx
// (باقی امپورٹس وہی پرانے رہیں گے)
import { useAuth } from "@/context/AuthContext"; // <-- نیا امپورٹ

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useAuth(); // <-- یوزر کا رول منگوائیں

  // ماسٹر مینیو
  const allMenuItems = [
    { name: "Analytics", icon: LayoutDashboard, path: "/dashboard", roles: ["admin", "teacher", "student"] },
    { name: "Students", icon: GraduationCap, path: "/students", roles: ["admin"] },
    { name: "Staff", icon: Users, path: "/staff", roles: ["admin"] },
    { name: "Attendance", icon: CheckSquare, path: "/attendance", roles: ["admin", "teacher"] },
    { name: "Fee Collection", icon: CreditCard, path: "/fees", roles: ["admin"] },
    { name: "Exams & Marks", icon: ClipboardEdit, path: "/marks", roles: ["admin", "teacher"] },
    { name: "Results", icon: Award, path: "/result", roles: ["admin", "student"] },
    { name: "Settings", icon: Settings, path: "/settings", roles: ["admin"] },
  ];

  // صرف وہی بٹن دکھائیں جس کی پرمیشن ہے
  const menuItems = allMenuItems.filter(item => item.roles.includes(role || "student"));

  // ... (باقی سارا SidebarLayout کا پرانا کوڈ ویسے ہی رہے گا)
