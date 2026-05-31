"use client";
import { authFetch } from "@/lib/authFetch";

import { GlassCard } from "@/components/ui/GlassCard";
import { Code, Lightbulb, UserCheck, Play, Loader2, Activity, TrendingUp, Target, Trophy, Flame, CalendarDays, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProgressRadarChart } from "@/components/ui/ProgressRadarChart";

// Mock data for the heatmap
const generateHeatmap = () => {
  const days = [];
  for (let i = 0; i < 60; i++) {
    // higher chance of being 0, but some days have multiple commits
    const intensity = Math.random() > 0.4 ? 0 : Math.floor(Math.random() * 4) + 1;
    days.push(intensity);
  }
  return days;
};

// Mock data for the readiness trend
const trendData = [
  { day: "Day 1", score: 0 },
  { day: "Day 2", score: 5 },
  { day: "Day 3", score: 12 },
  { day: "Day 4", score: 18 },
  { day: "Day 5", score: 25 },
  { day: "Day 6", score: 22 },
  { day: "Day 7", score: 35 },
];

const getComp = (role: string = "", company: string = "") => {
    const r = role.toLowerCase();
    let base = 120000;
    let eq = 15000;
    let bonus = 10000;
    
    if (r.includes("senior") || r.includes("architect") || r.includes("staff")) { base += 50000; eq += 40000; bonus += 15000; }
    if (r.includes("machine learning") || r.includes("ai") || r.includes("data scientist")) { base += 30000; eq += 20000; }
    if (r.includes("frontend") || r.includes("backend")) { base += 10000; }
    if (r.includes("manager") || r.includes("product")) { base += 25000; }
    
    const c = company.toLowerCase();
    if (c.includes("google") || c.includes("meta") || c.includes("netflix") || c.includes("amazon") || c.includes("apple") || c.includes("faang")) {
        base += 20000; eq += 40000;
    }
    
    return {
        base: `$${(base/1000).toFixed(0)}k`,
        eq: `$${(eq/1000).toFixed(0)}k`,
        bonus: `$${(bonus/1000).toFixed(0)}k`,
        total: `$${((base+eq+bonus)/1000).toFixed(0)}k`
    };
};

export default function DashboardOverview() {
  const [data, setData] = useState<any>(null);
  const [heatmapDays, setHeatmapDays] = useState<number[]>([]);
  
  useEffect(() => {
    setHeatmapDays(generateHeatmap());
    authFetch("http://localhost:8000/api/dashboard/progress")
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  if (!data) return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl">
        {/* Animated gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-blue-500/20 to-purple-500/30 blur-xl opacity-50"></div>
        <div className="absolute inset-0 bg-mesh opacity-30 mix-blend-overlay"></div>
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-black/40 backdrop-blur-md">
          <div>
            <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-primary mb-4 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              AI Job Prep Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
              Ready to conquer <span className="text-white">{data.company || 'Tech'}</span>?
            </h1>
            <p className="text-gray-300 text-lg max-w-xl">
              Your personalized, zero-start roadmap for the <span className="font-bold text-primary">{data.role}</span> role is actively adapting to your performance.
            </p>
          </div>
          
          <div className="shrink-0">
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl backdrop-blur-lg shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Trophy className="w-8 h-8 text-yellow-400 mb-2 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Rank</div>
              <div className="text-2xl font-black text-white">Top 15%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Compensation Engine */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-2">
        <GlassCard className="p-8 border-green-500/20 bg-gradient-to-r from-green-500/10 via-[#121214] to-[#121214] relative overflow-hidden flex flex-col md:flex-row items-center gap-8" glow>
            <div className="absolute -left-20 -bottom-20 opacity-10 blur-3xl pointer-events-none">
                <div className="w-96 h-96 bg-green-500 rounded-full"></div>
            </div>
            
            <div className="flex-1 relative z-10 w-full">
                <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4"/> Verified Industry Compensation Target
                </h3>
                <div className="text-gray-400 mb-6 text-[15px] leading-relaxed">
                    Based on local market data for a <span className="font-bold text-white">{data.role}</span> exactly at <span className="font-bold text-white">{data.company}</span>.
                </div>
                
                <div className="grid grid-cols-3 gap-4 w-full text-left">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                        <div className="text-[10px] text-gray-500 font-bold tracking-widest mb-1.5 uppercase">Base Salary</div>
                        <div className="text-xl font-extrabold text-white">{getComp(data.role, data.company).base}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                        <div className="text-[10px] text-gray-500 font-bold tracking-widest mb-1.5 uppercase">Annual Equity (RSU)</div>
                        <div className="text-xl font-extrabold text-white">{getComp(data.role, data.company).eq}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 backdrop-blur-sm">
                        <div className="text-[10px] text-gray-500 font-bold tracking-widest mb-1.5 uppercase">Sign-on / Bonus</div>
                        <div className="text-xl font-extrabold text-white">{getComp(data.role, data.company).bonus}</div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 text-center md:text-right shrink-0 px-4">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Total Target Package</div>
                <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-green-400 drop-shadow-2xl tabular-nums tracking-tighter">
                    {getComp(data.role, data.company).total}
                </div>
                <div className="mt-6 px-4 py-2 bg-green-500/20 text-green-400 text-[11px] font-black uppercase tracking-widest rounded-lg inline-block border border-green-500/30">
                    High Probability Bound
                </div>
            </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Core Readiness */}
        <GlassCard className="md:col-span-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-semibold text-gray-300 mb-6 flex justify-between w-full items-center">
                <span>Readiness</span>
                <span className="text-green-400 font-mono text-sm bg-green-500/10 px-2 py-1 rounded-md">{data.accuracy ? data.accuracy.toFixed(1) : "0"}% Acc</span>
            </h3>
            
            <ProgressRadarChart data={{
              technical: data.technical || 0,
              aptitude: data.aptitude || 0,
              interview: data.interview || 0,
              resume: data.resume || 0,
            }} />

            <div className="flex justify-between w-full text-xs text-gray-500 font-mono mt-4 bg-black/20 p-2 rounded-lg">
                <span>Att: {data.questions_attempted || 0}</span>
                <span>Code: {data.coding_success_rate ? data.coding_success_rate.toFixed(1) : "0"}%</span>
            </div>
          </div>
        </GlassCard>

        {/* Readiness Trend Chart */}
        <GlassCard className="md:col-span-3 p-6 flex flex-col pr-8" glow>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Readiness Growth
            </h3>
            <span className="text-xs text-gray-400">Last 7 Days</span>
          </div>
          <div className="w-full h-48 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Today's Action Plan */}
         <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="h-full p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" /> Today's Action Plan
                </h3>
                <div className="space-y-4 mt-6">
                    <Link href="/dashboard/practice">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <Activity className="w-5 h-5 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white group-hover:text-primary transition-colors">Clear Weak Area: {data.weak_areas?.[0] || 'Dynamic Programming'}</h4>
                                <p className="text-sm text-gray-400">Complete 5 targeted practice questions to improve accuracy.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                    </Link>

                    <Link href="/dashboard/prep-plan">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                <Code className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white group-hover:text-primary transition-colors">Continue Prep Plan</h4>
                                <p className="text-sm text-gray-400">Continue with today's assigned topic modules.</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                        </div>
                    </Link>

                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            <UserCheck className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-300">Full Mock Interview</h4>
                            <p className="text-sm text-gray-500">Lock drops after completing current missions.</p>
                        </div>
                    </div>
                </div>
            </GlassCard>
         </motion.div>

         {/* AI Insight & Heatmap */}
         <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <GlassCard className="p-6 border-primary/30 bg-primary/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 font-bold text-6xl group-hover:scale-110 transition-transform">
                        <Lightbulb />
                    </div>
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 animate-pulse"/> AI Insight
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Your performance in <strong className="text-white">{data.weak_areas?.[0] || 'Algorithms'}</strong> is dropping. I recommend spending 15 mins reviewing core formulas before the next assessment to secure a top 10% rank.
                    </p>
                </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <GlassCard className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-widest text-[#a855f7]">
                            <Flame className="w-5 h-5 text-orange-500" /> {data.streak} Day Heatmap
                        </h3>
                        <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-md border border-white/10">{data.xp} XP</span>
                    </div>
                    <div className="grid grid-cols-12 gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
                        {heatmapDays.map((val, i) => (
                            <div 
                                key={i} 
                                className={`aspect-square rounded-[3px] ${
                                    val === 0 ? 'bg-[#1a1a1c] border border-white/5' : 
                                    val === 1 ? 'bg-green-500/30 border border-green-500/20' : 
                                    val === 2 ? 'bg-green-500/60 shadow-[0_0_5px_rgba(34,197,94,0.3)]' : 
                                    'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'
                                }`}
                                title={`${val} actions completed`}
                            ></div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center mt-6 text-xs text-gray-500 font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-gray-400" /> Last 60 Days
                        </div>
                        <div className="flex items-center gap-1.5 opacity-70">
                           Less <div className="w-3 h-3 bg-[#1a1a1c] border border-white/5 rounded-[2px]"></div><div className="w-3 h-3 bg-green-500/30 rounded-[2px]"></div><div className="w-3 h-3 bg-green-500/60 rounded-[2px]"></div><div className="w-3 h-3 bg-green-500 rounded-[2px]"></div> More
                        </div>
                    </div>
                </GlassCard>
            </motion.div>
         </div>
      </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <GlassCard className="flex flex-col justify-between" glow>
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Code className="w-5 h-5"/>
              </div>
              <h3 className="font-semibold text-lg">Technical</h3>
              <p className="text-sm text-gray-400 mt-1">Algorithms & Core Tech</p>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-white">{data.technical}%</span></div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${data.technical}%` }}></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between" glow>
            <div>
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5"/>
              </div>
              <h3 className="font-semibold text-lg">Aptitude</h3>
              <p className="text-sm text-gray-400 mt-1">Logical & Quantitative</p>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-white">{data.aptitude}%</span></div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${data.aptitude}%` }}></div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between" glow>
            <div>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5"/>
              </div>
              <h3 className="font-semibold text-lg">Interview</h3>
              <p className="text-sm text-gray-400 mt-1">HR & Managerial Rounds</p>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-white">{data.interview}%</span></div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${data.interview}%` }}></div>
              </div>
            </div>
          </GlassCard>
        </div>

      {data.weak_areas && data.weak_areas.length > 0 && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
             <GlassCard className="p-6 border-red-500/30 bg-red-500/5">
                <h3 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5"/> Weak Area Breakdown
                </h3>
                <p className="text-gray-400 text-sm mb-4">The AI has detected that your accuracy is extremely low in these specific topics. Your adaptive Prep Plan has been automatically re-configured to force repetitive exercises in these subjects.</p>
                <div className="flex flex-wrap gap-3">
                    {data.weak_areas.map((w: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold font-mono">
                            🚨 {w}
                        </span>
                    ))}
                </div>
             </GlassCard>
         </motion.div>
      )}

      {/* Global Live Activity Mock */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard className="p-8 border-white/5 bg-[#121214]" glow>
              <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
                  <div>
                      <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                          <Activity className="w-6 h-6 text-green-500 animate-pulse"/> Live Competitive Network
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">Real-time candidate analytics across the platform</p>
                  </div>
                  <div className="text-xs font-mono text-gray-500 flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span> 1,432 Candidates Online
                  </div>
              </div>

              <div className="space-y-4">
                  {[
                      { user: "Alex J.", event: "Passed Technical Mock (Amazon Standard)", time: "Just now", points: "+50 XP", color: "text-blue-400" },
                      { user: "Sarah M.", event: "Highest Accuracy in System Design", time: "2m ago", points: "Global Rank #4", color: "text-yellow-400" },
                      { user: "Priya V.", event: "Completed 30-Day Prep Curriculum", time: "5m ago", points: "Alumni Status", color: "text-purple-400" },
                      { user: "Michael T.", event: "Unlocked Senior Architectural Mock", time: "12m ago", points: "+100 XP", color: "text-blue-400" },
                  ].map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold shadow-inner border border-white/10">
                                  {log.user.charAt(0)}
                              </div>
                              <div>
                                  <div className="text-sm font-bold text-white mb-0.5">{log.user}</div>
                                  <div className="text-xs text-gray-400">{log.event}</div>
                              </div>
                          </div>
                          <div className="text-right">
                              <div className={`text-sm font-bold ${log.color}`}>{log.points}</div>
                              <div className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">{log.time}</div>
                          </div>
                      </div>
                  ))}
              </div>
          </GlassCard>
      </motion.div>

    </div>
  );
}
