"use client";

import { Flame, Menu } from "lucide-react";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 border-b border-white/10 glass flex flex-row items-center justify-between md:justify-end px-4 md:px-6 sticky top-0 z-10 bg-background/50">
      <button 
        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
        onClick={onMenuClick}
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20 text-sm font-semibold">
          <Flame className="w-4 h-4" />
          <span>8 Days</span>
        </div>
      </div>
    </header>
  );
}
