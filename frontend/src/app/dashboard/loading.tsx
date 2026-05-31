"use client";

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
        <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
      </div>
      <p className="mt-4 text-gray-400 font-medium animate-pulse">Loading module...</p>
    </div>
  );
}
