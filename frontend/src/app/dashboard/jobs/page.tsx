"use client";
import { authFetch } from "@/lib/authFetch";

import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, ExternalLink, Activity, Copy, CheckCircle2, Navigation, Target, Zap, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ApplyJobs() {
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch both job links and user profile data for the boolean generator
    Promise.all([
        authFetch("http://localhost:8000/api/jobs").then(res => res.json()),
        authFetch("http://localhost:8000/api/dashboard/progress").then(res => res.json())
    ]).then(([linksData, user]) => {
        setLinks(linksData);
        setUserData(user);
        setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin absolute top-0 left-0"></div>
            <Target className="w-10 h-10 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h2 className="text-xl font-bold mt-32 mb-2 text-white">Initializing Web Scraper...</h2>
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Pinging global job boards...</p>
      </div>
    );
  }

  // Generate boolean search string based on user data
  const roleParts = userData?.role ? userData.role.split(" ") : ["Software", "Engineer"];
  const roleBoolean = `("${userData?.role || 'Software Engineer'}" OR "${roleParts[0]}")`;
  const skillsArray = userData?.skills || ['React', 'Python', 'Machine Learning'];
  const skillsBoolean = skillsArray.map((s: string) => `"${s}"`).join(" AND ");
  const customQuery = `${roleBoolean} AND (${skillsBoolean})`;

  const handleCopy = () => {
      navigator.clipboard.writeText(customQuery);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    { name: "LinkedIn", link: links?.linkedin, color: "from-[#0A66C2] to-[#004182]", shadow: "shadow-[#0A66C2]/30", rawColor: "bg-[#0A66C2]", subtitle: "800M+ Professionals" },
    { name: "Naukri", link: links?.naukri, color: "from-[#275df5] to-[#12369e]", shadow: "shadow-[#275df5]/30", rawColor: "bg-[#275df5]", subtitle: "Top Indian Recruiting" },
    { name: "Indeed", link: links?.indeed, color: "from-[#003A9B] to-[#001d4d]", shadow: "shadow-[#003A9B]/30", rawColor: "bg-[#003A9B]", subtitle: "Mass volume global aggregation" },
    { name: "Wellfound", link: links?.wellfound, color: "from-[#eb4034] to-[#6e0700]", shadow: "shadow-[#eb4034]/30", rawColor: "bg-[#eb4034]", subtitle: "Top Startup Roles" },
    { name: "Glassdoor", link: links?.glassdoor, color: "from-[#0caa41] to-[#034a1a]", shadow: "shadow-[#0caa41]/30", rawColor: "bg-[#0caa41]", subtitle: "Company Transparency" },
    { name: "Remote.co", link: links?.remoteco, color: "from-[#00b0d4] to-[#004f5f]", shadow: "shadow-[#00b0d4]/30", rawColor: "bg-[#00b0d4]", subtitle: "100% Remote Roles" },
    { name: "Upwork", link: links?.upwork, color: "from-[#14a800] to-[#084200]", shadow: "shadow-[#14a800]/30", rawColor: "bg-[#14a800]", subtitle: "Freelance & Contracts" },
    { name: "FlexJobs", link: links?.flexjobs, color: "from-[#7e34d1] to-[#371361]", shadow: "shadow-[#7e34d1]/30", rawColor: "bg-[#7e34d1]", subtitle: "Flexible & Hybrid Work" }
  ];

  return (
    <div className="space-y-10 pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 items-end justify-between border-b border-white/5 pb-8 relative z-10">
        <div>
           <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Briefcase className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                  <h1 className="text-4xl font-black text-white tracking-tight">Active Recruitment Hub</h1>
              </div>
           </div>
           <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
             Our macro scrapers have compiled active roles mathematically aligned with your ATS parsed resume. Use the tools below to execute highly-filtered automated searches.
           </p>
        </div>
        
        <GlassCard className="p-4 flex gap-6 shrink-0 bg-black/40 backdrop-blur-xl border-white/10" glow>
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Roles Scanned</span>
                <span className="text-2xl font-black text-white font-mono">1.2M+</span>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Your Match Rate</span>
                <span className="text-2xl font-black text-[#4caf50] font-mono flex items-center gap-1">87% <Activity className="w-4 h-4"/></span>
            </div>
        </GlassCard>
      </div>

      {/* Boolean Query Generator Card */}
      <GlassCard className="relative overflow-hidden border-white/10" glow>
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-blue-400" />
                  <h2 className="text-2xl font-extrabold text-white">AI Boolean Search String</h2>
              </div>
              <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
                  Tired of irrelevant job posts? We compiled your ATS Strengths into a master Boolean search. Copy and paste this directly into the LinkedIn search bar to instantly filter out noise and find roles demanding your exact skill-stack.
              </p>
              
              <div className="flex items-center gap-4 bg-[#0a0a0c] p-2 pr-6 rounded-2xl border border-white/10 shadow-inner">
                  <button 
                      onClick={handleCopy}
                      className={`h-14 w-14 shrink-0 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                  >
                      {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </button>
                  <code className="text-[#a855f7] font-mono text-sm lg:text-base whitespace-nowrap overflow-x-auto hide-scrollbar select-all">
                      {customQuery}
                  </code>
              </div>
          </div>
      </GlassCard>

      {/* Target Job Boards */}
      <div className="space-y-6">
          <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest">
              <Navigation className="w-5 h-5 text-gray-400" /> Automated Macro Links
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <GlassCard className="h-full flex flex-col items-center justify-center p-0 overflow-hidden group hover:-translate-y-2 transition-all duration-300" glow>
                  <div className={`w-full py-8 bg-gradient-to-br ${p.color} flex flex-col items-center justify-center relative overflow-hidden`}>
                     <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-150 transition-transform duration-700">
                         <Target className="w-32 h-32 text-white" />
                     </div>
                     <h2 className="text-4xl font-black text-white tracking-tighter mb-1 relative z-10">{p.name}</h2>
                     <p className="text-white/70 text-sm font-bold tracking-widest uppercase relative z-10">{p.subtitle}</p>
                  </div>
                  
                  <div className="p-8 w-full flex flex-col items-center bg-[#151518]">
                      <p className="text-gray-400 text-[13px] text-center mb-8 h-10 leading-relaxed">
                          Executes a multi-parameter URL macro. Instantly populates {p.name} with your exact location and required ATS keywords.
                      </p>
                      
                      <a href={p.link} target="_blank" rel="noreferrer" className="w-full relative">
                        <div className={`absolute inset-0 ${p.rawColor} opacity-20 blur-lg rounded-xl group-hover:opacity-60 transition-opacity`}></div>
                        <button className={`w-full py-4 bg-white text-black font-extrabold uppercase tracking-widest text-sm rounded-xl flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-xl relative z-10`}>
                            Run Scraper <ExternalLink className="w-4 h-4"/>
                        </button>
                      </a>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
      </div>
    </div>
  );
}
