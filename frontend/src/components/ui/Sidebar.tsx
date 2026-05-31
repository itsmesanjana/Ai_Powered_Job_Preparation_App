"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, FileText, Target, Mic, Settings, User, AlertCircle, X } from "lucide-react";

export function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Prep Plan", href: "/dashboard/prep-plan", icon: Target },
    { name: "Practice Arena", href: "/dashboard/practice", icon: Briefcase },
    { name: "Mock Interview", href: "/dashboard/mock-interview", icon: Mic },
    { name: "Resume ATS", href: "/dashboard/resume", icon: FileText },
    { name: "Final Assessment", href: "/dashboard/assessment", icon: AlertCircle },
    { name: "Apply Jobs", href: "/dashboard/jobs", icon: Target },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out w-64 glass border-r border-t-0 border-b-0 border-l-0 border-white/10 h-screen flex flex-col p-4 bg-background/95 md:bg-background/50 z-50`}>
        <div className="flex items-center justify-between px-2 py-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 shadow-lg shadow-primary/30 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">PrepAI</span>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.name} href={link.href} prefetch={true} onClick={() => setIsOpen && setIsOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary/20 text-primary font-medium border border-primary/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                  {link.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
          <Link href="/onboarding" onClick={() => setIsOpen && setIsOpen(false)}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Settings className="w-5 h-5" />
              Change Plan & Role
            </div>
          </Link>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
          >
            <User className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
