"use client";
import { authFetch } from "@/lib/authFetch";

import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2, AlertCircle, Play, CheckCircle, Clock, ShieldAlert, MonitorCheck, EyeOff, LayoutGrid } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function AssessmentEngine() {
  const [loading, setLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [finalResults, setFinalResults] = useState<{score: number, total: number, breakdown: any, codingPass: boolean} | null>(null);
  
  const [codes, setCodes] = useState<string[]>(["", ""]);
  const [codeOutputs, setCodeOutputs] = useState<any[]>([null, null]);
  const [executing, setExecuting] = useState(false);

  type PhaseType = "intro" | "aptitude" | "verbal" | "technical" | "coding" | "finished";
  const [phase, setPhase] = useState<PhaseType>("intro");
  
  const [activeStep, setActiveStep] = useState(0); // 0 to 19 within an MCQ phase
  const [codingStep, setCodingStep] = useState(0); // 0 to 1 for the 2 coding questions

  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({
      aptitude: {},
      verbal: {},
      technical: {}
  });
  
  // Timer State (60 minutes for the full 4 phase test)
  const [timeLeft, setTimeLeft] = useState(60 * 60);

  useEffect(() => {
    let timer: any;
    if (phase !== "intro" && phase !== "finished" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && phase !== "finished") {
      setPhase("finished");
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const startAssessment = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`http://localhost:8000/api/assessment/final`);
      let data = await res.json();
      
      if (data.error) {
          alert("AI Error generating assessment: " + data.error);
          return;
      }

      // Help normalize whatever the LLM returned (in case it used capital keys)
      const normalizedData: any = {};
      Object.keys(data).forEach(key => {
          normalizedData[key.toLowerCase()] = data[key];
      });

      if (!normalizedData.aptitude || !normalizedData.verbal || !normalizedData.technical) {
          alert("AI generated incomplete assessment structure. Please try again.");
          return;
      }

      setAssessmentData(normalizedData);
      setPhase("aptitude");
      setActiveStep(0);
      setTimeLeft(60 * 60);
    } catch (err) {
      console.error(err);
      alert("Failed to securely load assessment. Check server connection.");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (opt: string) => {
      setAnswers(prev => ({
          ...prev,
          [phase]: {
              ...prev[phase as string],
              [activeStep]: opt
          }
      }));
  }

  const handleNextMCQ = () => {
    const questionsList = assessmentData[phase];
    if (activeStep < questionsList.length - 1) {
      setActiveStep((s) => s + 1);
    } else {
      // Proceed to next phase
      if (phase === "aptitude") { setPhase("verbal"); setActiveStep(0); }
      else if (phase === "verbal") { setPhase("technical"); setActiveStep(0); }
      else if (phase === "technical") { setPhase("coding"); setActiveStep(0); }
    }
  };

  const finishAssessment = () => {
    let correctCount = 0;
    let totalMCQ = 0;
    const breakdown: Record<string, {correct: number, total: number}> = {};

    ["aptitude", "verbal", "technical"].forEach(p => {
        if (!assessmentData[p]) return;
        let pCorrect = 0;
        let pTotal = assessmentData[p].length;
        
        assessmentData[p].forEach((q: any, i: number) => {
             const userAns = answers[p] ? answers[p][i] : null;
             // Compare first character (A, B, C, D)
             if (userAns && q.correct_answer && userAns.charAt(0).toUpperCase() === q.correct_answer.charAt(0).toUpperCase()) {
                 pCorrect++;
                 correctCount++;
             }
             totalMCQ++;
        });
        
        breakdown[p] = { correct: pCorrect, total: pTotal };
    });

    // Check code output
    let codingPass = true;
    if (assessmentData.coding && assessmentData.coding.length > 0) {
        assessmentData.coding.forEach((prob: any, idx: number) => {
            if (!codeOutputs[idx] || codeOutputs[idx].status !== "Passed") {
                codingPass = false;
            }
        });
    } else {
        codingPass = false;
    }

    const finalPercentage = Math.round((correctCount / Math.max(1, totalMCQ)) * 100);
    setFinalResults({
        score: finalPercentage,
        total: totalMCQ,
        breakdown,
        codingPass
    });

    setPhase("finished");
    authFetch(`http://localhost:8000/api/practice/complete?type=technical&score=${finalPercentage}`, { method: "POST"});
  };

  if (phase === "finished" && finalResults) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center py-10 pb-20">
        <GlassCard className="max-w-3xl w-full p-12 shadow-[0_0_50px_rgba(34,197,94,0.15)] border-green-500/20" glow>
            <div className="flex flex-col items-center text-center border-b border-white/10 pb-10 mb-10">
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 rounded-full border border-green-500/50 animate-ping opacity-30"></div>
                    <CheckCircle className="w-12 h-12 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                </div>
                <h1 className="text-4xl font-black mb-4 tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Assessment Locked</h1>
                <p className="text-gray-400 text-lg max-w-lg mb-8 leading-relaxed">
                    Simulation sequence completed. Proctor engines have deactivated. Diagnostics calculated.
                </p>

                <div className="text-[120px] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-600 tabular-nums drop-shadow-2xl">
                    {finalResults.score}%
                </div>
                <div className="text-green-500/50 uppercase tracking-widest font-extrabold mt-2">Overall MCQ Rating</div>
            </div>

            <div className="space-y-6 mb-12">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Diagnostic Breakdown</h3>
                
                {/* Aptitude */}
                <div className="bg-[#151518] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                        <div className="text-blue-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><div className="w-2 h-2 bg-blue-400 rounded-full"></div> Aptitude & Logic</div>
                    </div>
                    <div className="font-mono text-2xl font-bold bg-white/5 px-4 py-2 rounded-lg text-white">
                        {finalResults.breakdown['aptitude']?.correct || 0} / {finalResults.breakdown['aptitude']?.total || 10}
                    </div>
                </div>

                {/* Verbal */}
                <div className="bg-[#151518] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                        <div className="text-purple-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><div className="w-2 h-2 bg-purple-400 rounded-full"></div> Verbal Ability</div>
                    </div>
                    <div className="font-mono text-2xl font-bold bg-white/5 px-4 py-2 rounded-lg text-white">
                        {finalResults.breakdown['verbal']?.correct || 0} / {finalResults.breakdown['verbal']?.total || 10}
                    </div>
                </div>

                {/* Technical */}
                <div className="bg-[#151518] p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                        <div className="text-orange-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><div className="w-2 h-2 bg-orange-400 rounded-full"></div> Core Technical</div>
                    </div>
                    <div className="font-mono text-2xl font-bold bg-white/5 px-4 py-2 rounded-lg text-white">
                        {finalResults.breakdown['technical']?.correct || 0} / {finalResults.breakdown['technical']?.total || 10}
                    </div>
                </div>

                {/* Coding */}
                <div className="bg-[#151518] p-6 rounded-2xl border border-white/5 flex items-center justify-between mt-4">
                    <div>
                        <div className="text-red-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Algorithm Sandbox</div>
                        <p className="text-gray-500 text-xs mt-1 font-mono">Runtime STDOUT Evaluation against constraints</p>
                    </div>
                    <div className={`font-mono text-xl font-bold px-5 py-2 rounded-lg uppercase tracking-widest border-2 ${finalResults.codingPass ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}`}>
                        {finalResults.codingPass ? "PASS" : "FAIL"}
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button onClick={() => window.location.href='/dashboard'} className="px-12 py-5 bg-white text-black font-extrabold rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Return to Dashboard
                </button>
            </div>
        </GlassCard>
      </div>
    );
  }

  // --- MCQ PHASES (Aptitude, Verbal, Technical) ---
  if (["aptitude", "verbal", "technical"].includes(phase)) {
    const questions = assessmentData[phase] || [];
    const q = questions[activeStep];
    const currentAnswer = answers[phase][activeStep];
    
    // Dynamic Header Phase Styling
    const phaseColor = phase === 'aptitude' ? 'text-blue-500' : phase === 'verbal' ? 'text-purple-500' : 'text-orange-500';
    const phaseBorder = phase === 'aptitude' ? 'border-blue-500/50' : phase === 'verbal' ? 'border-purple-500/50' : 'border-orange-500/50';
    const phaseBg = phase === 'aptitude' ? 'bg-blue-500/10' : phase === 'verbal' ? 'bg-purple-500/10' : 'bg-orange-500/10';
    const phaseTitle = phase === 'aptitude' ? 'Quantitative & Logical' : phase === 'verbal' ? 'Verbal Ability' : 'Core Technical CS';

    return (
      <div className="min-h-[85vh] flex flex-col relative pb-8">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-[#09090b]/95 backdrop-blur-xl border-b border-white/10 pb-4 mb-8 pt-4">
            <div className="flex justify-between items-center max-w-6xl mx-auto px-4">
                <div className="flex items-center gap-6">
                    <h2 className={`text-2xl font-black uppercase tracking-widest flex items-center gap-3 ${phaseColor}`}>
                        <ShieldAlert className="w-6 h-6"/> Phase {phase === 'aptitude' ? '1' : phase === 'verbal' ? '2' : '3'}: {phaseTitle}
                    </h2>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-5 py-2.5 rounded-xl">
                        <MonitorCheck className="w-4 h-4 text-red-500 animate-pulse"/>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Proctoring Active</span>
                    </div>
                    <div className="font-mono bg-[#1a1a1c] border border-white/10 px-6 py-2.5 rounded-xl font-bold text-xl text-white flex items-center gap-3 shadow-inner">
                        <Clock className="w-5 h-5 text-gray-400"/> {formatTime(timeLeft)}
                    </div>
                </div>
            </div>
            {/* Minimal top progress bar bridging all phases */}
            <div className="max-w-6xl mx-auto px-4 mt-6 flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span className={phase === 'aptitude' ? 'text-white' : ''}>1. Aptitude</span>
                <div className="flex-1 border-t border-dashed border-white/10 mx-4"></div>
                <span className={phase === 'verbal' ? 'text-white' : ''}>2. Verbal</span>
                <div className="flex-1 border-t border-dashed border-white/10 mx-4"></div>
                <span className={phase === 'technical' ? 'text-white' : ''}>3. Technical</span>
                <div className="flex-1 border-t border-dashed border-white/10 mx-4"></div>
                <span>4. Coding</span>
            </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-6xl mx-auto w-full px-4 items-start">
            
            {/* Left: Question Area */}
            <GlassCard glow className={`lg:col-span-3 p-10 border ${phaseBorder} shadow-2xl relative`}>
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
               
               <div className="flex justify-between items-center mb-8">
                   <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                       <LayoutGrid className="w-4 h-4"/> Question {activeStep + 1}
                   </h3>
                   <span className="text-xs text-gray-500 italic">Do not switch tabs. 1 Warning left.</span>
               </div>
               
               <h3 className="text-3xl font-extrabold mb-10 leading-[1.4] text-white">
                   {q?.question}
               </h3>
               
               <div className="space-y-4 mb-10">
                 {q?.options?.map((opt: string, i: number) => {
                    const isSelected = currentAnswer === opt;
                    const letter = String.fromCharCode(65 + i); // A, B, C, D
                    
                    return (
                        <div 
                           key={i} 
                           onClick={() => selectAnswer(opt)}
                           className={`group flex items-center p-4 rounded-2xl border transition-all cursor-pointer ${isSelected ? `${phaseBg} ${phaseBorder} shadow-lg shadow-${phaseColor.split('-')[1]}-500/20` : 'bg-[#151518] border-white/10 hover:border-gray-500 hover:bg-[#1a1a1c]'}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold mr-4 shrink-0 transition-colors ${isSelected ? `bg-${phaseColor.split('-')[1]}-500 text-white shadow-md` : 'bg-white/5 text-gray-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                                {letter}
                            </div>
                            <span className={`text-lg font-medium leading-relaxed ${isSelected ? 'text-white' : 'text-gray-300'}`}>{opt}</span>
                        </div>
                    );
                 })}
               </div>

               <div className="flex justify-between items-center pt-8 border-t border-white/10">
                  <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="px-6 py-3 font-bold text-gray-400 hover:text-white disabled:opacity-30 transition-colors">
                      Previous
                  </button>
                  <button onClick={handleNextMCQ} disabled={!currentAnswer} className={`px-10 py-4 ${currentAnswer ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-white/10 text-gray-500'} transition-all rounded-xl font-bold flex items-center gap-2`}>
                    {activeStep < questions.length - 1 ? "Save & Next" : "Complete Section"}
                  </button>
               </div>
            </GlassCard>

            {/* Right: Navigator Tracker */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-40">
                <GlassCard className="p-6 border-white/5 bg-black/40 backdrop-blur-xl">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 text-center">Section Navigator</h4>
                    <div className="grid grid-cols-3 gap-3">
                        {questions.map((_: any, idx: number) => {
                            const isAnswered = !!answers[phase][idx];
                            const isCurrent = activeStep === idx;
                            
                            let boxClass = 'bg-[#151518] border-white/10 text-gray-500';
                            if (isCurrent) boxClass = `border-${phaseColor.split('-')[1]}-500 text-white ${phaseBg} shadow-inner`;
                            else if (isAnswered) boxClass = 'bg-white/10 border-white/30 text-white';

                            return (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveStep(idx)}
                                    className={`aspect-square rounded-xl border flex items-center justify-center font-bold text-lg transition-all ${boxClass}`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </GlassCard>
            </div>
        </div>
      </div>
    );
  }

  // --- CODING PHASE ---
  if (phase === "coding" && assessmentData.coding) {
    const codingProblem = assessmentData.coding[codingStep] || assessmentData.coding[0];
    return (
      <div className="h-[90vh] flex flex-col relative">
        <div className="flex justify-between items-center mb-6 px-4 shrink-0">
           <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest flex items-center gap-3">
             <ShieldAlert className="w-6 h-6"/> Phase 4: Technical Logic Node
           </h2>
           <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg">
                    <MonitorCheck className="w-4 h-4 text-red-500 animate-pulse"/>
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Locked</span>
                </div>
                <div className="font-mono bg-[#1a1a1c] border border-white/10 px-6 py-2 rounded-lg font-bold text-xl text-white flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400"/> {formatTime(timeLeft)}
                </div>
           </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
            {/* Left: Problem Statement */}
            <GlassCard className="lg:col-span-5 p-8 border-white/10 h-full flex flex-col overflow-y-auto hide-scrollbar bg-black/40">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{codingProblem?.title || "Algorithm"}</h3>
                    <div className="flex gap-2">
                        {assessmentData.coding.map((_: any, idx: number) => (
                            <button 
                                key={idx} 
                                onClick={() => setCodingStep(idx)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${codingStep === idx ? 'bg-primary text-black shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
                <p className="text-gray-300 leading-relaxed mb-8 flex-1 text-[15px]">{codingProblem?.description || "Loading constraints..."}</p>
                
                <div className="space-y-4">
                    <div className="bg-[#151518] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <span className="text-gray-500 block mb-2 text-xs uppercase tracking-widest font-bold">Standard Input (STDIN)</span>
                        <div className="font-mono text-sm text-blue-300 break-all">
                            {typeof codingProblem?.sample_input === 'object' ? JSON.stringify(codingProblem.sample_input, null, 2) : codingProblem?.sample_input}
                        </div>
                    </div>
                    <div className="bg-[#151518] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                        <span className="text-gray-500 block mb-2 text-xs uppercase tracking-widest font-bold">Expected Output (STDOUT)</span>
                        <div className="font-mono text-sm text-green-300 break-all">
                             {typeof codingProblem?.sample_output === 'object' ? JSON.stringify(codingProblem.sample_output, null, 2) : codingProblem?.sample_output}
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Right: Code Editor & Execution */}
            <GlassCard className="lg:col-span-7 p-0 border-white/10 flex flex-col overflow-hidden bg-[#1e1e1e]">
                <div className="bg-[#2d2d2d] h-12 flex justify-between items-center px-6 border-b border-[#111] shrink-0">
                    <div className="flex gap-2 items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                        <span className="ml-4 font-mono text-xs text-gray-400">algorithm_submission_{codingStep + 1}.py</span>
                    </div>
                    <div className="text-xs uppercase font-extrabold text-[#4caf50] tracking-widest">
                        Python 3.10
                    </div>
                </div>
                
                <div className="flex-1 flex relative">
                    <div className="w-12 bg-[#2d2d2d] border-r border-[#404040] flex flex-col items-center py-4 text-[#858585] text-sm font-mono pointer-events-none select-none">
                        {[...Array(20)].map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                    <textarea 
                      value={codes[codingStep] || ""}
                      onChange={(e) => {
                          const newCodes = [...codes];
                          newCodes[codingStep] = e.target.value;
                          setCodes(newCodes);
                      }}
                      className="flex-1 h-full bg-transparent text-[#d4d4d4] p-4 font-mono text-sm focus:outline-none resize-none leading-relaxed"
                      placeholder="def optimal_solution(data):&#10;    # Write your algorithmic logic here&#10;    # Ensure your STDOUT matches the Expected Output&#10;    pass"
                      spellCheck={false}
                    ></textarea>
                </div>
                
                {codeOutputs[codingStep] !== null && (
                    <div className={`bg-[#1e1e1e] border-t border-[#333] p-5 max-h-48 overflow-y-auto font-mono text-sm shrink-0 ${codeOutputs[codingStep]?.status === 'Passed' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}`}>
                       <div className="flex justify-between items-center mb-3">
                           <span className="text-gray-500 font-bold text-xs uppercase tracking-widest block">Execution Result</span>
                           <span className={`font-black text-lg uppercase tracking-widest ${codeOutputs[codingStep]?.status === 'Passed' ? 'text-green-500' : 'text-red-500'}`}>{codeOutputs[codingStep]?.status || "Failed"}</span>
                       </div>
                       <pre className="text-gray-300 whitespace-pre-wrap mb-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">{codeOutputs[codingStep]?.output || "Syntax Error"}</pre>
                       <div className="bg-blue-500/10 p-3 rounded-xl text-xs text-blue-300 border border-blue-500/20">
                           <strong className="text-blue-400 uppercase tracking-widest text-[10px]">AI Feedback</strong><br/>
                           {codeOutputs[codingStep]?.feedback || "Check logic."}
                       </div>
                    </div>
                )}
                
                <div className="bg-[#151515] p-6 border-t border-[#333] flex justify-between items-center shrink-0">
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Plagiarism scan will run upon submission</span>
                    <div className="flex gap-4">
                        <button onClick={async () => {
                            setExecuting(true);
                            try {
                                const res = await authFetch("http://localhost:8000/api/practice/run", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ 
                                        code: codes[codingStep] || "", 
                                        language: "python",
                                        question: codingProblem?.description || "Algorithm",
                                        sample_input: typeof codingProblem?.sample_input === 'object' ? JSON.stringify(codingProblem.sample_input) : String(codingProblem?.sample_input),
                                        sample_output: typeof codingProblem?.sample_output === 'object' ? JSON.stringify(codingProblem.sample_output) : String(codingProblem?.sample_output)
                                    })
                                });
                                const data = await res.json();
                                const newOutputs = [...codeOutputs];
                                newOutputs[codingStep] = data;
                                setCodeOutputs(newOutputs);
                            } catch (err) {
                                const newOutputs = [...codeOutputs];
                                newOutputs[codingStep] = {status: "Failed", output: "Network execution failed.", feedback: "Backend error."};
                                setCodeOutputs(newOutputs);
                            } finally {
                                setExecuting(false);
                            }
                        }} disabled={executing} className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold tracking-widest uppercase text-sm rounded-xl transition-all">
                            {executing ? "Processing..." : "Run Test Cases"}
                        </button>
                        <button onClick={finishAssessment} className="px-10 py-3.5 bg-red-600 text-white font-extrabold tracking-widest uppercase text-sm rounded-xl hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105">
                            Submit Final Block
                        </button>
                    </div>
                </div>
            </GlassCard>
        </div>
      </div>
    );
  }

  // INTRO PHASE (Landing)
  return (
    <div className="flex xl:items-center justify-center min-h-[85vh] relative py-12">
      {/* Background Warning Stripes mock */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)'}}></div>

      <GlassCard glow className="max-w-2xl w-full p-12 text-center border-red-500/30 bg-black/80 backdrop-blur-3xl shadow-[0_0_80px_rgba(239,68,68,0.15)] relative z-10 rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>

        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/30 relative">
          <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping opacity-30"></div>
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-4xl lg:text-5xl font-black mb-6 uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">Official Company Mock</h1>
        <p className="text-gray-400 mb-10 leading-relaxed text-lg max-w-lg mx-auto">
          You are about to enter a rigorous, strict-proctored simulation replicating top-tier enterprise assessment pipelines.
        </p>
        
        <div className="text-left space-y-3 mb-10 bg-[#151518] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-gray-400 font-bold flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Section 1: Aptitude & Logic</span>
                <span className="font-mono text-white font-black bg-white/5 px-2 py-0.5 rounded">20 Nodes</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3 pt-2">
                <span className="text-gray-400 font-bold flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Section 2: Verbal Ability</span>
                <span className="font-mono text-white font-black bg-white/5 px-2 py-0.5 rounded">20 Nodes</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3 pt-2">
                <span className="text-gray-400 font-bold flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Section 3: Technical Theory</span>
                <span className="font-mono text-white font-black bg-white/5 px-2 py-0.5 rounded">20 Nodes</span>
            </div>
            <div className="flex justify-between items-center pt-2">
                <span className="text-gray-400 font-bold flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-red-500"></div> Section 4: Coding Paradigm</span>
                <span className="font-mono text-white font-black bg-white/5 px-2 py-0.5 rounded">2 Tasks</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex items-center justify-center gap-3 text-red-500 font-bold text-sm">
                <Clock className="w-5 h-5"/> 60 Min Timer
            </div>
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex items-center justify-center gap-3 text-red-500 font-bold text-sm">
                <MonitorCheck className="w-5 h-5"/> Tab Locked
            </div>
        </div>
        
        <button onClick={startAssessment} disabled={loading} className="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center hover:bg-gray-200 transition-all disabled:opacity-50 shadow-[0_0_40px_rgba(255,255,255,0.2)] text-lg hover:scale-[1.02]">
          {loading ? <><span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-3"></span> Securing Environment...</> : <span className="flex items-center gap-3"><Play className="w-6 h-6 fill-black"/> Initialize Sequence</span>}
        </button>
      </GlassCard>
    </div>
  );
}
