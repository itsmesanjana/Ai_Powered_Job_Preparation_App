"use client";
import { authFetch } from "@/lib/authFetch";

import { GlassCard } from "@/components/ui/GlassCard";
import { CheckCircle2, XCircle, FileText, Loader2, Target, Sparkles, AlertTriangle, TrendingUp, Cpu, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";

export default function ResumeATS() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive Suggestion States
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [generatedBullet, setGeneratedBullet] = useState<{keyword: string, text: string} | null>(null);

  const handleGenerateSuggestion = (keyword: string) => {
      setGeneratingFor(keyword);
      setGeneratedBullet(null);
      // Simulate AI generation delay
      setTimeout(() => {
          setGeneratedBullet({
              keyword,
              text: `Spearheaded the implementation of ${keyword} within the core microservices architecture, reducing deployment latency by 35% and improving overall system resilience during peak load conditions.`
          });
          setGeneratingFor(null);
      }, 1500);
  };

  useEffect(() => {
    authFetch("http://localhost:8000/api/resume/data")
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin absolute top-0 left-0"></div>
            <Target className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <p className="text-gray-400 mt-24 font-bold tracking-widest uppercase text-sm">Analyzing ATS Compatibility...</p>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-24 h-24 bg-red-500/10 flex items-center justify-center rounded-full mb-6">
            <Target className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-white">No Resume Found</h2>
        <p className="text-gray-400 leading-relaxed max-w-xs">{data.error}</p>
        <button className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-xl">
            Upload PDF to Scan
        </button>
      </div>
    );
  }

  const score = Math.round(data.ats_score || 0);
  const isGreat = score >= 80;
  const isMid = score >= 50 && score < 80;
  const isBad = score < 50;

  const scoreColor = isGreat ? "text-[#4caf50]" : isMid ? "text-[#fbbf24]" : "text-[#f44336]";
  const scoreBg = isGreat ? "bg-[#4caf50]" : isMid ? "bg-[#fbbf24]" : "bg-[#f44336]";
  const strokeColor = isGreat ? "#4caf50" : isMid ? "#fbbf24" : "#f44336";

  const numStrengths = data.skills?.length || 0;
  const numMissing = data.missing_keywords?.length || 0;

  return (
    <div className="space-y-10 relative pb-20">
      
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight">ATS Diagnostic Report</h1>
            </div>
            <p className="text-gray-400 max-w-xl text-lg mt-4">
               Our proprietary parsing engine analyzed your PDF. We compared its keyword density and semantic structure against standard FAANG job descriptions constraints.
            </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Document Status</span>
                <span className="text-white font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Successfully Parsed</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Visual Score */}
        <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-8 text-center flex flex-col items-center justify-center relative overflow-hidden" glow>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
                
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Overall Match Rate</h2>
                
                {/* SVG Circular Progress */}
                <div className="relative w-48 h-48 mb-8">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                        {/* Background track */}
                        <circle cx="50" cy="50" r="40" className="text-white/5" strokeWidth="6" stroke="currentColor" fill="transparent" />
                        {/* Foreground progress */}
                        <circle cx="50" cy="50" r="40" strokeWidth="6" stroke={strokeColor} fill="transparent"
                            strokeDasharray={`${(score / 100) * 251.2} 251.2`} 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                        />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <span className={`text-6xl font-black ${scoreColor} tracking-tighter`}>{score}</span>
                        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">out of 100</span>
                    </div>
                </div>

                <div className={`px-4 py-2 rounded-lg bg-white/5 border border-white/10 w-full text-left flex items-start gap-3`}>
                    <Cpu className={`w-5 h-5 mt-0.5 ${scoreColor}`} />
                    <div>
                        <h4 className="font-bold text-white mb-1">AI Verdict</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {isGreat ? "Excellent keyword placement. High chance of passing automated parsing filters." :
                             isMid ? "Moderate risk. You are missing critical hard skills needed to bypass strict ATS filters." :
                             "High risk. Your resume format or keyword density does not meet minimum job requirements."}
                        </p>
                    </div>
                </div>
            </GlassCard>

            <GlassCard className="p-6 bg-gradient-to-br from-[#121214] to-[#0c0c0e]">
                <h3 className="font-bold text-white mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> Optimization Impact
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Strengths Found</span>
                        <span className="font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full">{numStrengths} Keywords</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Missing Elements</span>
                        <span className="font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full">{numMissing} Keywords</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden flex mt-2">
                        <div className="h-full bg-green-500" style={{width: `${(numStrengths / (numStrengths + numMissing)) * 100}%`}}></div>
                        <div className="h-full bg-red-500" style={{width: `${(numMissing / (numStrengths + numMissing)) * 100}%`}}></div>
                    </div>
                </div>
            </GlassCard>
        </div>

        {/* Right Column: Keyword Breakdowns */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Action Items */}
            <GlassCard className="p-8 border-red-500/30 bg-red-500/5 relative overflow-hidden" glow>
                <div className="absolute right-0 top-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                
                <h3 className="text-xl font-extrabold mb-2 flex items-center gap-3 text-white">
                    <AlertTriangle className="w-6 h-6 text-red-500" /> Missing Job-Critical Keywords
                </h3>
                <p className="text-sm text-gray-400 mb-8 max-w-2xl leading-relaxed">
                    Automated screeners will instantly reject your resume if it lacks these core proficiencies. Inject them naturally into bullet points using the STAR method.
                </p>
                
                <div className="flex flex-wrap gap-3">
                    {data.missing_keywords && data.missing_keywords.length > 0 ? (
                        data.missing_keywords.map((k: string, idx: number) => (
                            <div key={idx} className="group flex flex-col gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={() => handleGenerateSuggestion(k)}
                                    className="px-4 py-2 bg-[#1f1618] border border-red-500/30 text-red-300 font-medium rounded-xl text-sm shadow-sm cursor-pointer hover:bg-red-500/10 hover:border-red-400 transition-all flex items-center justify-between gap-3 w-fit"
                                >
                                    {k}
                                    <Sparkles className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:text-yellow-400 transition-colors" />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Your resume perfectly matches the target keyword constraints!
                        </div>
                    )}
                </div>

                {/* AI Interactive Generator Panel */}
                {(generatingFor || generatedBullet) && (
                    <div className="mt-6 p-6 rounded-2xl bg-[#121214] border border-white/10 relative overflow-hidden">
                        {generatingFor && (
                           <div className="flex items-center gap-3 text-sm font-bold text-yellow-500">
                               <Loader2 className="w-5 h-5 animate-spin" /> Synthesizing optimal S.T.A.R. phrase for "{generatingFor}"...
                           </div>
                        )}
                        
                        {generatedBullet && !generatingFor && (
                            <div className="space-y-3">
                                <div className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Recommended Addition
                                </div>
                                <p className="text-white text-[15px] font-mono leading-relaxed border-l-2 border-primary pl-4 py-1 italic opacity-90">
                                    "{generatedBullet.text}"
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Copy and adapt this structurally-perfect bullet point into your experience section to satisfy ATS requirements for '{generatedBullet.keyword}'.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </GlassCard>

            {/* Strengths */}
            <GlassCard className="p-8 border-green-500/20" glow>
                <h3 className="text-xl font-extrabold mb-2 flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-green-500" /> Verified Proficiencies
                </h3>
                <p className="text-sm text-gray-400 mb-8 max-w-2xl leading-relaxed">
                    These keywords successfully bypassed our parsing algorithm and positively contributed to your overall ATS Match Rate.
                </p>
                
                <div className="flex flex-wrap gap-3">
                    {data.skills && data.skills.length > 0 ? (
                        data.skills.map((s: string, idx: number) => (
                            <span key={idx} className="px-4 py-2 bg-[#121c15] border border-green-500/20 text-green-400 font-medium rounded-xl text-sm shadow-sm">
                                {s}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 italic text-sm">No specific role strengths detected. Validate your PDF formatting.</span>
                    )}
                </div>
            </GlassCard>

        </div>
      </div>
      
      {/* Document Viewer */}
      <h3 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-3 text-white">
          <Briefcase className="w-6 h-6 text-primary" /> Text Extraction Preview
      </h3>
      <div className="bg-[#1e1e1e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Mock Window Header */}
          <div className="h-12 bg-[#2d2d2d] border-b border-[#111] flex items-center px-4 shrink-0">
              <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="mx-auto flex items-center gap-2 opacity-50">
                  <FileText className="w-4 h-4 text-white" />
                  <span className="text-xs font-mono text-white tracking-widest">parsed_document_content.txt</span>
              </div>
          </div>
          
          <div className="p-8 max-h-[500px] overflow-y-auto hide-scrollbar bg-gradient-to-b from-[#1e1e1e] to-[#151515]">
              <div className="max-w-3xl mx-auto">
                  <p className="text-[#d4d4d4] font-mono text-[13px] leading-[1.8] whitespace-pre-wrap layout-document">
                      {data.original_text || "Error retrieving raw text."}
                  </p>
              </div>
          </div>
      </div>

    </div>
  );
}
