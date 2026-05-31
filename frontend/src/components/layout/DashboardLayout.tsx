"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "../ui/Sidebar";
import { Navbar } from "../ui/Navbar";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col relative overflow-hidden w-full">
        {/* Background glow effects for dashboard */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10 pointer-events-none transform-gpu will-change-transform"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none transform-gpu will-change-transform"></div>
        
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth w-full">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
