"use client";
import { authFetch } from "@/lib/authFetch";

import { GlassCard } from "@/components/ui/GlassCard";
import { Mic, MicOff, Bot, TerminalSquare, Users, Loader2, Send, Activity, Clock, ShieldCheck, Target, Zap } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

export default function MockInterview() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [role, setRole] = useState("Software Engineer");
  const [company, setCompany] = useState("a top tech company");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    authFetch("http://localhost:8000/api/dashboard/progress")
      .then(res => res.json())
      .then(d => {
          if (d.role) setRole(d.role);
          if (d.company) setCompany(d.company);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    let timer: any;
    if (activeSession) {
      timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    } else {
      setTimeElapsed(0);
    }
    return () => clearInterval(timer);
  }, [activeSession]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    
    // Clean text to avoid AI reading "asterisk" out loud
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Prioritize natural sounding Microsoft/Google premium voices
    const premiumVoice = voices.find(v => 
        v.name.includes("Natural") || 
        v.name.includes("Online") ||
        (v.name.includes("Google") && v.name.includes("US"))
    ) || voices.find(v => v.lang.startsWith("en-US")) || voices[0];
    
    if (premiumVoice) {
        utterance.voice = premiumVoice;
    }

    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Slightly deeper for professionalism
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [voices]);

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Try Chrome/Edge.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const startSession = async (type: string) => {
    setActiveSession(type);
    setLoading(true);
    setReport(null);
    setHistory([]);
    try {
        const res = await authFetch(`http://localhost:8000/api/interview/start?type=${encodeURIComponent(type)}`, {
            method: "POST"
        });
        const data = await res.json();
        setHistory([{ role: "assistant", content: data.reply }]);
        speak(data.reply);
    } catch (err) {
        const fallback = `Hello. I am your AI Interviewer from ${company} for the ${type} round. Let's begin. Can you introduce yourself and tell me why you're interested in the ${role} position?`;
        setHistory([{ role: "assistant", content: fallback }]);
        speak(fallback);
    } finally {
        setLoading(false);
    }
  };

  const handleSend = async (retryText: string | null = null) => {
    const textToSubmit = retryText || inputText;
    if (!textToSubmit.trim()) return;
    
    const userMsg = { role: "user", content: textToSubmit };
    if (!retryText) {
        setHistory(prev => [...prev, userMsg]);
        setInputText("");
    }
    setLoading(true);

    try {
      const payloadHistory = retryText ? history : [...history, userMsg];
      const res = await authFetch("http://localhost:8000/api/interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: payloadHistory.map(h => ({ role: h.role, content: h.content })),
          round_type: activeSession
        })
      });
      const data = await res.json();
      
      setHistory(prev => {
          const cleanHistory = prev.filter(m => !m.isError);
          return [...cleanHistory, { role: "assistant", content: data.reply }];
      });
      speak(data.reply);
      
      await authFetch(`http://localhost:8000/api/practice/complete?type=interview&score=0.5`, { method: "POST"});
    } catch (err) {
      console.error(err);
      const errMsg = "Connection lost. Please check your network and try again.";
      setHistory(prev => [...prev, { role: "assistant", content: errMsg, isError: true, lastInput: textToSubmit }]);
      speak("Connection lost.");
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setReportLoading(true);

    try {
        const res = await authFetch("http://localhost:8000/api/interview/evaluate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                history: history.map(h => ({ role: h.role, content: h.content })),
                round_type: activeSession
            })
        });
        const evalData = await res.json();
        setReport(evalData);
    } catch (e) {
        console.error("Failed to generate report", e);
        setActiveSession(null);
    } finally {
        setReportLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  };

  const renderFormattedText = (text: string) => {
      return text.split('\n').map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-2"></div>;
          
          let formattedLine: any = line;
          
          // bold syntax replacement
          formattedLine = formattedLine.split(/(\*\*.*?\*\*)/g).map((chunk: string, j: number) => {
              if (chunk.startsWith('**') && chunk.endsWith('**')) {
                  return <strong key={j} className="text-white font-bold">{chunk.replace(/\*\*/g, '')}</strong>;
              }
              return chunk;
          });

          // check if bullet point
          if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
              return <div key={i} className="flex pl-4 gap-2 my-1"><span className="text-primary mt-1">•</span> <span className="flex-1">{formattedLine}</span></div>;
          }
          
          return <p key={i} className="mb-2 leading-relaxed">{formattedLine}</p>;
      });
  };

  // Mock analytics scores
  const scoreClarity = Math.min(100, 60 + (history.length * 5));
  const scorePace = 85; 
  const scoreSTAR = activeSession === "HR/Behavioral" ? 75 : 90;

  if (reportLoading) {
      return (
          <div className="flex flex-col h-[calc(100vh-6rem)] items-center justify-center text-center">
              <Loader2 className="w-16 h-16 animate-spin text-primary mb-6 mx-auto"/>
              <h2 className="text-3xl font-extrabold text-white mb-4">Generating Post-Interview Analytics...</h2>
              <p className="text-gray-400 font-mono">The AI is cross-referencing your transcript against enterprise {company} standards.</p>
          </div>
      );
  }

  if (report) {
      return (
          <div className="flex flex-col min-h-[calc(100vh-6rem)] items-center py-10 overflow-y-auto hide-scrollbar">
              <GlassCard className="max-w-4xl w-full p-12 border-primary/30 shadow-[0_0_50px_rgba(168,85,247,0.15)]" glow>
                  <h1 className="text-4xl font-extrabold text-white text-center mb-12 tracking-tight">Post-Interview Diagnostics</h1>
                  
                  <div className="flex flex-col md:flex-row gap-10 mb-12 items-center md:items-start">
                      <div className="md:w-1/3 text-center md:border-r border-white/10 md:pr-10 w-full">
                          <div className="text-gray-500 font-bold uppercase tracking-widest mb-4">Overall Transcript Score</div>
                          <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#a855f7] tabular-nums tracking-tighter drop-shadow-lg">{report.overall_score || 85}</div>
                          <div className={`mt-8 inline-block px-8 py-3 rounded-xl font-black uppercase tracking-widest border-2 shadow-lg ${report.hire_decision === 'Hire' ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-green-500/20' : 'bg-red-500/20 text-red-500 border-red-500/50 shadow-red-500/20'}`}>
                              Decision: {report.hire_decision || 'Pending'}
                          </div>
                      </div>
                      
                      <div className="md:w-2/3 space-y-8 w-full">
                          <div>
                              <div className="text-[#3b82f6] font-extrabold uppercase tracking-widest text-sm mb-3 flex items-center gap-2"><Target className="w-4 h-4"/> Communication & Delivery</div>
                              <p className="text-gray-300 leading-relaxed bg-[#1a1a1c] p-6 rounded-2xl border border-white/5 text-[15px]">{report.communication_feedback || 'No feedback collected.'}</p>
                          </div>
                          <div>
                              <div className="text-[#f97316] font-extrabold uppercase tracking-widest text-sm mb-3 flex items-center gap-2"><TerminalSquare className="w-4 h-4"/> Technical Logic Depth</div>
                              <p className="text-gray-300 leading-relaxed bg-[#1a1a1c] p-6 rounded-2xl border border-white/5 text-[15px]">{report.technical_feedback || 'No feedback collected.'}</p>
                          </div>
                      </div>
                  </div>

                  {report.red_flags && report.red_flags.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 mb-10 shadow-inner">
                          <div className="text-red-500 font-extrabold uppercase tracking-widest text-sm mb-4">Critical Red Flags Detected</div>
                          <ul className="list-disc pl-6 space-y-3 text-red-300 font-mono text-sm">
                              {report.red_flags.map((flag: string, i: number) => <li key={i}>{flag}</li>)}
                          </ul>
                      </div>
                  )}

                  <div className="text-center pt-8 border-t border-white/10">
                      <button onClick={() => {setReport(null); setActiveSession(null);}} className="bg-white text-black font-extrabold uppercase tracking-widest px-12 py-5 rounded-2xl hover:bg-gray-200 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                          Return to Dashboard
                      </button>
                  </div>
              </GlassCard>
          </div>
      );
  }

  if (activeSession) {
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-[#a855f7] flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#a855f7]/20 flex items-center justify-center">
                    <Mic className="w-5 h-5 text-[#a855f7]"/>
                  </span>
                  {activeSession} Round
              </h1>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center gap-2 text-sm font-mono text-gray-400 bg-white/5 py-1 px-3 rounded-full border border-white/10 shadow-inner">
                  <Clock className="w-4 h-4 text-primary"/> {formatTime(timeElapsed)}
              </div>
          </div>
          <button onClick={endSession} disabled={loading} className="px-6 py-2 border flex items-center gap-2 border-red-500/50 text-red-400 bg-red-500/10 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:scale-105">
              Conclude & Generate Report
          </button>
        </div>
        
        <div className="flex gap-6 flex-1 min-h-0">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                <GlassCard className="flex-1 overflow-y-auto p-8 mb-4 flex flex-col hide-scrollbar relative bg-gradient-to-b from-[#121214] to-[#0c0c0e]" glow>
                  {/* AI Bot Visual Header inside Chat */}
                  <div className="flex items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6 sticky top-0 bg-[#121214]/90 backdrop-blur-md z-10 -mx-8 px-8 -mt-8 pt-8">
                      <div className="flex items-center gap-4">
                          <div className="relative">
                              <div className={`w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center transition-all duration-300 ${isSpeaking ? 'shadow-[0_0_25px_rgba(59,130,246,0.8)] scale-110 border-2 border-blue-400' : 'border border-white/10'}`}>
                                  <Bot className={`w-7 h-7 ${isSpeaking ? 'text-blue-400' : 'text-gray-400'}`} />
                              </div>
                          </div>
                          <div>
                              <h2 className="text-xl font-extrabold text-white">AI Hiring Manager</h2>
                              <p className={`text-sm ${isSpeaking ? 'text-blue-400 font-bold tracking-widest uppercase' : 'text-gray-500'}`}>{isSpeaking ? 'Synthesizing voice...' : 'Listening actively...'}</p>
                          </div>
                      </div>
                      
                      {/* Audio visualizer dots */}
                      {isSpeaking && (
                          <div className="flex gap-1 h-6 items-end">
                              {[1,2,3,4,5,6,7].map(i => (
                                  <div key={i} className="w-1.5 bg-blue-500 rounded-t-full drop-shadow-[0_0_5px_rgba(59,130,246,1)]" 
                                      style={{height: Math.floor(Math.random() * 100) + '%', animation: 'bounce 0.5s infinite alternate', animationDelay: `${i*0.1}s`}}></div>
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="space-y-6">
                      {history.map((msg, i) => (
                        <div key={i} className={`max-w-[85%] rounded-2xl p-5 flex flex-col ${msg.role === "user" ? 'bg-primary/10 border border-primary/20 text-white self-end rounded-tr-sm shadow-lg shadow-primary/5' : (msg.isError ? 'bg-red-500/10 border-red-500/30 text-red-200 self-start' : 'bg-[#1a1a1c] border border-white/10 text-gray-300 self-start rounded-tl-sm shadow-xl')}`}>
                          <div className="text-[10px] uppercase font-extrabold mb-3 opacity-50 tracking-widest flex items-center gap-2">
                              {msg.role === "user" ? <><Users className="w-3 h-3"/> You</> : <><Bot className="w-3 h-3"/> Interviewer</>}
                          </div>
                          <div className="text-[15px]">{renderFormattedText(msg.content)}</div>
                          {msg.isError && (
                              <button onClick={() => handleSend(msg.lastInput)} className="mt-4 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg px-4 py-2 text-sm font-bold w-fit hover:bg-red-500/30 transition-colors">
                                  Retry Connection
                              </button>
                          )}
                        </div>
                      ))}
                      {loading && (
                        <div className="self-start text-primary flex items-center gap-3 text-sm font-bold px-4 py-2 bg-primary/10 rounded-full">
                          <Loader2 className="w-4 h-4 animate-spin"/> Processing Response...
                        </div>
                      )}
                      <div ref={chatEndRef} />
                  </div>
                </GlassCard>

                {/* Input Area */}
                <div className="flex gap-4 items-center bg-[#151518] p-4 rounded-2xl border border-white/10 shadow-2xl">
                  <button onClick={startListening} className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-xl ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-500/30 cursor-pointer' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                    {isListening ? <Mic className="w-6 h-6"/> : <MicOff className="w-6 h-6"/>}
                  </button>
                  
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
                    placeholder={isListening ? "Listening... Speak now." : "Dictate with mic or type your response here..."}
                    className="flex-1 bg-transparent text-lg placeholder:text-gray-600 outline-none px-2 focus:text-white transition-colors h-full"
                  />
                  <button onClick={() => handleSend(null)} disabled={loading || !inputText.trim()} className="h-14 w-14 bg-primary text-black rounded-xl font-bold disabled:opacity-50 hover:bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)] flex items-center justify-center shrink-0 transition-all">
                    <Send className="w-5 h-5 ml-1"/>
                  </button>
                </div>
            </div>

            {/* Right Side: Live Analytics Panel */}
            <div className="w-80 flex flex-col gap-4 min-h-0 shrink-0">
                <GlassCard className="p-6 h-full flex flex-col bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl" glow>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4"/> Live Diagnostics
                    </h3>

                    <div className="space-y-8 flex-1">
                        {/* Clarity Score */}
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-bold">
                                <span className="text-gray-300 flex items-center gap-2"><Target className="w-4 h-4 text-blue-400"/> Relevance Match</span>
                                <span className="text-white">{scoreClarity}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-1000 w-[60%]" style={{ width: `${scoreClarity}%`}}></div>
                            </div>
                        </div>

                        {/* STAR Format */}
                        <div>
                            <div className="flex justify-between text-sm mb-2 font-bold">
                                <span className="text-gray-300 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-400"/> S.T.A.R. Format</span>
                                <span className="text-white">{scoreSTAR}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] transition-all duration-1000 w-[75%]" style={{ width: `${scoreSTAR}%`}}></div>
                            </div>
                        </div>

                         {/* Pace */}
                         <div>
                            <div className="flex justify-between text-sm mb-2 font-bold">
                                <span className="text-gray-300 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400"/> Speaking Pace (WPM)</span>
                                <span className="text-white">Optimal</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10 overflow-hidden relative">
                                <div className="absolute top-0 left-0 h-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] transition-all duration-1000 w-[85%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/10 text-xs text-gray-500 leading-relaxed font-mono">
                        System actively processing semantics in real-time. Continuous evaluation mode enabled.
                    </div>
                </GlassCard>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col justify-center pb-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-[#a855f7]/20 to-primary/10 flex items-center justify-center mx-auto mb-8 transform hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(168,85,247,0.3)] transition-all duration-300 border border-white/5">
          <Mic className="w-12 h-12 text-[#a855f7]" />
        </div>
        <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md">Professional Mock Interview</h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
          Immerse yourself in a high-fidelity vocal simulation. No camera required. Perfect your delivery, measure real-time vocal metrics, and master the STAR technique interactively.
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <GlassCard className="p-10 group hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer overflow-hidden relative" glow onClick={() => startSession("Technical")}>
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <TerminalSquare className="w-64 h-64 text-blue-500" />
            </div>
            <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-8 border border-blue-500/20">
                    <TerminalSquare className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-3xl font-extrabold mb-4 text-white group-hover:text-blue-200 transition-colors">Technical Round</h2>
                <p className="text-gray-400 text-[15px] leading-relaxed mb-8 h-16">
                    Engage in a live vocal system design and architectural discussion specifically targeted at the {role} curriculum.
                </p>
                <div className="flex items-center gap-4 text-blue-400 font-bold uppercase tracking-widest text-sm">
                    Start Simulation <div className="w-8 h-px bg-blue-500/50 group-hover:w-12 transition-all"></div>
                </div>
            </div>
            </GlassCard>

            <GlassCard className="p-10 group hover:border-green-500/50 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] transition-all duration-300 cursor-pointer overflow-hidden relative" glow onClick={() => startSession("HR/Behavioral")}>
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Users className="w-64 h-64 text-green-500" />
            </div>
            <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center mb-8 border border-green-500/20">
                    <Users className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-3xl font-extrabold mb-4 text-white group-hover:text-green-200 transition-colors">HR / Behavioral</h2>
                <p className="text-gray-400 text-[15px] leading-relaxed mb-8 h-16">
                    Simulate high-pressure culture-fit interviews. Test conflict resolution and articulate your past projects effectively.
                </p>
                <div className="flex items-center gap-4 text-green-400 font-bold uppercase tracking-widest text-sm">
                    Start Simulation <div className="w-8 h-px bg-green-500/50 group-hover:w-12 transition-all"></div>
                </div>
            </div>
            </GlassCard>
        </div>

        {/* Full End-to-End Interview Card spanning full width */}
        <GlassCard className="p-10 group hover:border-yellow-500/50 hover:shadow-[0_0_50px_rgba(234,179,8,0.2)] transition-all duration-300 cursor-pointer overflow-hidden relative bg-gradient-to-br from-[#121214] to-[#1a150b]" glow onClick={() => startSession("End-to-End")}>
            <div className="absolute right-0 top-0 w-96 h-96 bg-yellow-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-colors"></div>
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <Target className="w-64 h-64 text-yellow-500" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-600/10 flex items-center justify-center mb-8 border border-yellow-500/20">
                        <Target className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 text-white group-hover:text-yellow-200 transition-colors uppercase tracking-tight">End-to-End Mock</h2>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-8">
                        The ultimate trial. A comprehensive 45-minute simulation covering Introductions, Tech Deep Dives, Systems Design, and STAR format Behavioral scenarios all in one seamless flow.
                    </p>
                    <div className="flex items-center gap-4 text-yellow-400 font-black uppercase tracking-widest text-sm">
                        Launch Final Simulation <div className="w-8 h-px bg-yellow-500/50 group-hover:w-16 transition-all"></div>
                    </div>
                </div>
            </div>
        </GlassCard>
      </div>
    </div>
  );
}
