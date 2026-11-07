import { Compass, LayoutDashboard, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center text-center p-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-lg">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          404 Not Found
        </span>
        <h1 className="text-2xl font-black text-gray-900 mt-3 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          The requested page or resource could not be found or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm active:scale-95 text-sm"
          >
            <LayoutDashboard size={16} /> Return to Dashboard
          </Link>
          <Link
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-95 text-sm"
          >
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
