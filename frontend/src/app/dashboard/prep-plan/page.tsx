"use client";
import { authFetch } from "@/lib/authFetch";

import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, Calendar, Youtube, BookOpen, Play, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PrepPlan() {
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState<any>(null);

  useEffect(() => {
    authFetch("http://localhost:8000/api/prep-plan/generate")
      .then(res => res.json())
      .then(data => {
        setPlanData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-400">AI is mapping your custom role-based timeline...</p>
      </div>
    );
  }

  // Fallback if data is weird
  const safeDays = Array.isArray(planData?.days) ? planData.days : [];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Dynamic Prep Roadmap</h1>
        <p className="text-gray-400">
          Generated using your ATS gaps, targeted for a {safeDays.length}-day sprint.
        </p>
      </div>

      <div className="relative pl-4 md:pl-12 space-y-8 before:absolute before:inset-0 before:ml-4 md:before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent">
        {safeDays.map((day: any, i: number) => {
          const isFirst = i === 0;
          const searchTitle = encodeURIComponent(day.title + " tutorial");
          const youtubeUrl = `https://www.youtube.com/results?search_query=${searchTitle}`;
          const articleUrl = `https://www.google.com/search?q=${searchTitle}`;

          return (
            <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center group"
            >
              {/* Timeline dot */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0a0a] ${isFirst ? 'bg-primary text-black' : 'bg-[#1a1a1a] text-gray-500 group-hover:text-primary transition-colors'} shrink-0 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] absolute left-0 md:left-2 -ml-5 md:-ml-1 z-10`}>
                {isFirst ? <Play className="w-4 h-4 fill-black ml-0.5" /> : <div className="font-bold text-sm">{i + 1}</div>}
              </div>

              {/* Card Container */}
              <div className="w-[calc(100%-3rem)] ml-[3rem]">
                <GlassCard glow={isFirst} className={`p-6 transition-all duration-300 ${isFirst ? 'border-primary/50 scale-[1.02]' : 'hover:border-white/20'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isFirst ? 'text-primary' : 'text-gray-500'}`}>
                        Day {i + 1}
                      </span>
                      <h3 className={`text-xl font-bold ${isFirst ? 'text-white' : 'text-gray-300'}`}>{day.title}</h3>
                    </div>
                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono flex items-center gap-2 text-gray-400">
                      <Calendar className="w-3 h-3" /> {day.time || "2 Hours"}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider text-[10px] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" /> Key Concepts & Materials
                      </h4>
                      <div className="flex flex-col gap-4">
                        {day.modules?.map((mod: any, j: number) => {
                          const isObject = typeof mod === 'object' && mod !== null;
                          const name = isObject ? mod.name : mod;
                          const notes = isObject ? mod.notes : null;
                          
                          const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(day.title + ' ' + name + ' tutorial')}`;
                          const ytName = "Watch Tutorial";
                          
                          const docUrl = `https://www.google.com/search?q=${encodeURIComponent(day.title + ' ' + name + ' documentation geeksforgeeks')}`;
                          const docName = "Read Docs";

                          return (
                              <div key={j} className={`p-5 rounded-xl border ${isFirst ? 'bg-[#151518] border-white/10' : 'bg-black/20 border-white/5'} transition-all hover:border-primary/30 shadow-lg`}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h5 className="font-bold text-white mb-2 text-lg">{name}</h5>
                                        {notes && <p className="text-sm text-gray-400 leading-relaxed font-serif italic border-l-2 border-primary/30 pl-3 py-0.5">{notes}</p>}
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-36 overflow-hidden">
                                        <a href={ytUrl} target="_blank" rel="noreferrer" className="flex-1 text-center truncate bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                            <Youtube className="w-3.5 h-3.5" /> <span className="truncate">{ytName}</span>
                                        </a>
                                        <a href={docUrl} target="_blank" rel="noreferrer" className="flex-1 text-center truncate bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                                            <BookOpen className="w-3.5 h-3.5" /> <span className="truncate">{docName}</span>
                                        </a>
                                    </div>
                                </div>
                              </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                      {isFirst && (
                        <Link href="/dashboard/practice" className="ml-auto w-full md:w-auto">
                            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-extrabold uppercase tracking-widest rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] text-xs">
                                <CheckCircle2 className="w-4 h-4" /> Enter Practice Arena
                            </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
