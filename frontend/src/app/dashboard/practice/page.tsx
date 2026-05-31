"use client";
import { authFetch } from "@/lib/authFetch";

import { GlassCard } from "@/components/ui/GlassCard";
import { Play, Code, Layers, Loader2, X, Terminal, ChevronRight, CheckCircle2, ChevronDown, Brain, Database, Server, MessageSquare, Table, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function PracticeArena() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [loading, setLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const [questionData, setQuestionData] = useState<any>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [role, setRole] = useState("Software Engineer");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [language, setLanguage] = useState("Python");

  useEffect(() => {
    authFetch("http://localhost:8000/api/dashboard/progress")
      .then(res => res.json())
      .then(d => {
          if (d.role) setRole(d.role);
      })
      .catch(console.error);
  }, []);

  const aptitudeTopics = [
      { group: "Quantitative Aptitude", topics: ["Percentages & Fractions", "Profit and Loss", "Time and Work", "Speed, Distance & Time", "Probability", "Permutations & Combinations", "Simple & Compound Interest", "Averages & Mixtures", "Number System", "Geometry & Mensuration", "Data Interpretation", "Boats & Streams", "Pipes & Cisterns", "Clocks & Calendars", "Logarithms"] },
      { group: "Logical Reasoning", topics: ["Syllogisms", "Blood Relations", "Seating Arrangements", "Number Series", "Direction Sense", "Coding-Decoding", "Venn Diagrams", "Data Sufficiency", "Statement & Assumptions", "Cube & Dice", "Odd Man Out", "Analogies"] },
      { group: "Verbal Ability", topics: ["Reading Comprehension", "Sentence Correction", "Para Jumbles", "Synonyms & Antonyms", "Error Spotting", "Idioms & Phrases", "One Word Substitution", "Cloze Test", "Active & Passive Voice", "Direct & Indirect Speech"] }
  ];
  const cognitiveTopics = ["Grid Memory Deductions", "Pattern Recognition", "Spatial Reasoning", "Sequence finding", "Inductive Logic", "Syllogism Visualization", "Cryptarithmetic Puzzles", "Non-Verbal Analogies", "Figure Matrix", "Mirror & Water Images", "Paper Folding", "Visual Perception Matrix", "Alphanumeric Number Puzzles"];
  const behavioralTopics = ["Conflict Resolution", "Leadership & Initiative", "Handling Failure & Mistakes", "Time Management & Prioritization", "Adaptability under Pressure", "Working with Difficult Team Members", "Cross-Functional Collaboration", "Client/Stakeholder Management", "Ethical Dilemmas"];
  const theoryTopics = ["Operating Systems", "DBMS Fundamentals", "Computer Networks", "OOPs Principles", "Data Structures Theory", "Software Engineering Life Cycle", "Network Security & Cryptography", "Cloud Computing Basics", "Linux Administration", "Version Control (Git)", "Microservices Theory", "API Design Principles (REST)", "Virtualization & Containers"];
  const designTopics = ["Design Netflix VOD", "Design Twitter Feed", "Scaling a Database", "URL Shortener System", "Distributed API Rate Limiter", "Design Uber / Ride-Sharing", "Design WhatsApp (WebSockets & Queue)", "Design E-Commerce Inventory Hub", "Design Google Docs (CRDTs)", "Design Ticketmaster", "Design a Distributed Web Crawler", "Design Notification Service", "Design Location Based Service (Yelp)"];
  const sqlTopics = ["Complex Table Joins", "Window Functions (OVER, PARTITION)", "Subqueries & CTEs", "Data Aggregation (GROUP BY)", "Schema Optimization & Indexing", "Triggers & Constraints", "Recursive CTEs", "Pivoting Data Arrays", "Date & Timestamp Manipulations", "Advanced String Functions", "Handling NULLs (COALESCE)", "JSON Operations in SQL", "Dense Ranking Functions", "Query Performance Tuning"];
  const languageTopics = ["Basic Syntax & Variables", "Control Flow (If/Else, Loops)", "Functions & Scope", "Object-Oriented Programming (Classes & Objects)", "Inheritance & Polymorphism", "Error Handling & Exceptions", "File I/O Operations", "Memory Management & Pointers", "Concurrency & Threads", "Data Collections & Generics", "String Manipulation", "Regular Expressions (Regex)"];
  
  const technicalTopics: Record<string, string[]> = {
    "Software Engineer": ["Arrays", "Strings", "Hash Tables", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Backtracking", "Sorting Algorithms", "Searching", "Heaps & Priority Queues", "Greedy Algorithms", "Sliding Window", "Two Pointers"],
    "Data Science": ["Python ML Basics", "Pandas DataFrames", "Feature Engineering", "Model Evaluation", "Neural Networks Intro", "SQL Tensors", "Random Forests", "K-Means Clustering", "PCA Dimensionality", "NLP Tokenization"],
    "Data Analyst": ["SQL Advanced Queries", "Data Cleaning", "Statistics", "Excel Modeling", "Power BI Logic", "Window Functions", "CTEs", "A/B Testing Math", "Cohort Analysis", "ETL Pipelines"],
    "Frontend": ["React State", "Next.js Routing", "JavaScript Closures", "CSS Flexbox & Grid", "DOM Manipulation", "GraphQL API Integration", "Redux Thunks", "WebSockets Handling", "Debouncing & Throttling", "Accessibility Patterns"],
    "Backend": ["REST APIs", "FastAPI/Express", "Database Indexing", "System Caching", "Microservices", "Docker Containerization", "Kafka Message Queues", "JWT Middlewares", "Database Sharding", "Concurrency/Threads"],
    "DevOps": ["CI/CD Pipelines", "Docker & Kubernetes", "AWS/GCP Cloud Ops", "Terraform Configs", "Bash Scripting", "Prometheus/Grafana Alerts", "Ansible Automation", "Network Load Balancing"],
    "Product Manager": ["Agile Methodologies", "User Story Prioritization", "A/B Testing Frameworks", "Feature Analytics", "Sprint Planning", "Go-To-Market Strategy", "Product Roadmapping", "Stakeholder Management"],
    "UI/UX": ["Responsive Layouts", "Figma Prototyping", "Color Theory & Contrast", "Wireframing", "User Sentiment Tests", "Information Architecture", "Heuristic Evaluation", "Micro-Interactions"]
  };

  const getTechnicalTopicsForRole = (r: string) => {
      const lower = r.toLowerCase();
      if (lower.includes("frontend")) return technicalTopics["Frontend"];
      if (lower.includes("backend") || lower.includes("full stack")) return technicalTopics["Backend"];
      if (lower.includes("data analyst") || lower.includes("business")) return technicalTopics["Data Analyst"];
      if (lower.includes("data scientist") || lower.includes("machine learning") || lower.includes("ai")) return technicalTopics["Data Science"];
      if (lower.includes("devops") || lower.includes("cloud") || lower.includes("cybersecurity") || lower.includes("sre")) return technicalTopics["DevOps"];
      if (lower.includes("product")) return technicalTopics["Product Manager"];
      if (lower.includes("ui") || lower.includes("ux")) return technicalTopics["UI/UX"];
      return technicalTopics["Software Engineer"]; 
  };

  const getTopicsForModal = () => {
      switch(activeModal) {
          case 'language': return languageTopics;
          case 'aptitude': return aptitudeTopics;
          case 'behavioral': return behavioralTopics;
          case 'cognitive': return cognitiveTopics;
          case 'theory': return theoryTopics;
          case 'design': return designTopics;
          case 'sql': return sqlTopics;
          case 'code': return getTechnicalTopicsForRole(role);
          default: return [];
      }
  };
  const currentTopics = getTopicsForModal();

  const [userResponse, setUserResponse] = useState("");
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);

  const handleGenerate = async (isNext = false) => {
    if (!topic) return;
    if (isNext) setNextLoading(true);
    else setLoading(true);
    
    setShowAnswer(false);
    setSelectedOption(null);
    setUserResponse("");
    
    try {
      let endpoint = "";
      if (activeModal === "code" || activeModal === "language" || activeModal === "sql") {
          endpoint = `coding/question?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}&language=${encodeURIComponent(language)}`;
      } else if (activeModal === "aptitude" || activeModal === "cognitive" || activeModal === "theory") {
          endpoint = `apti/question?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}`;
      } else if (activeModal === "design" || activeModal === "behavioral") {
          endpoint = `open/question?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}&q_type=${activeModal}`;
      }

      const res = await authFetch(`http://localhost:8000/api/${endpoint}`, { method: "POST" });
      const data = await res.json();
      setQuestionData(data);
      if (activeModal === "code" || activeModal === "language") {
          let boilerplate = `def solution():\n    pass`;
          if (language === "Java") boilerplate = `public class Solution {\n    public static void main(String[] args) {\n        // Write code here\n    }\n}`;
          else if (language === "C++") boilerplate = `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write code here\n    return 0;\n}`;
          else if (language === "JavaScript") boilerplate = `function solution() {\n    // Write code here\n}`;
          
          if (data.sample_input && typeof data.sample_input === "string" && language === "Python") {
             boilerplate = `# Write your implementation...\n\ndef solution(input_data):\n    pass\n`;
          }
          setUserResponse(boilerplate);
      } else if (activeModal === "sql") {
          setUserResponse(`-- Write your SQL query here...\nSELECT * FROM table_name;`);
      }
      setEvalResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      if (isNext) setNextLoading(false);
      else setLoading(false);
    }
  };

  const runEvaluation = async () => {
    if (!userResponse.trim() || !questionData) return;
    setEvalLoading(true);
    try {
      let res;
      if (activeModal === "code" || activeModal === "language" || activeModal === "sql") {
          res = await authFetch(`http://localhost:8000/api/practice/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: userResponse,
                language: activeModal === "sql" ? "SQL" : language,
                question: String(questionData.title || "") + " " + String(questionData.description || ""),
                sample_input: questionData.sample_input || "",
                sample_output: questionData.sample_output || ""
            })
          });
      } else {
          // For System Design free text evaluation
          res = await authFetch(`http://localhost:8000/api/open/evaluate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: String(questionData.title || "") + " " + String(questionData.description || ""),
                answer: userResponse,
                q_type: activeModal
            })
          });
      }
      const data = await res.json();
      setEvalResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEvalLoading(false);
    }
  };

  const completeTask = async (isCorrect = false) => {
    await authFetch(`http://localhost:8000/api/practice/complete?type=${activeModal === 'code' ? 'technical' : 'aptitude'}&score=2.5&topic=${encodeURIComponent(topic)}&is_correct=${isCorrect}`, { method: "POST"});
    setQuestionData(null);
    setActiveModal(null);
  };

  const tryAgain = () => {
    setUserResponse(activeModal === "code" ? `def solution():\n    pass\n` : activeModal === "sql" ? `-- Write your SQL query here...\nSELECT * FROM table_name;` : "");
    setEvalResult(null);
  };

  // Helper flags
  const isMcqMode = activeModal === "aptitude" || activeModal === "cognitive" || activeModal === "theory";
  const isTextMode = activeModal === "design" || activeModal === "behavioral";
  const isCodeMode = activeModal === "code" || activeModal === "language" || activeModal === "sql";

  const renderModuleCard = (id: string, Icon: any, col: string, title: string, desc: string, BtnIcon: any) => {
    const activeColorStr = col === 'blue' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : col === 'orange' ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : col === 'indigo' ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : col === 'purple' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : col === 'green' ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : col === 'cyan' ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : col === 'rose' ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]';
    const bgColClass = col === 'blue' ? 'from-blue-500/20 to-blue-600/10' : col === 'orange' ? 'from-orange-500/20 to-orange-600/10' : col === 'indigo' ? 'from-indigo-500/20 to-indigo-600/10' : col === 'purple' ? 'from-purple-500/20 to-purple-600/10' : col === 'green' ? 'from-green-500/20 to-green-600/10' : col === 'cyan' ? 'from-cyan-500/20 to-cyan-600/10' : col === 'rose' ? 'from-rose-500/20 to-rose-600/10' : 'from-pink-500/20 to-pink-600/10';
    const textColClass = col === 'blue' ? 'text-blue-500' : col === 'orange' ? 'text-orange-500' : col === 'indigo' ? 'text-indigo-500' : col === 'purple' ? 'text-purple-500' : col === 'green' ? 'text-green-500' : col === 'cyan' ? 'text-cyan-500' : col === 'rose' ? 'text-rose-500' : 'text-pink-500';
    const hoverBgColClass = col === 'blue' ? 'hover:bg-blue-500' : col === 'orange' ? 'hover:bg-orange-500' : col === 'indigo' ? 'hover:bg-indigo-500' : col === 'purple' ? 'hover:bg-purple-500' : col === 'green' ? 'hover:bg-green-500' : col === 'cyan' ? 'hover:bg-cyan-500' : col === 'rose' ? 'hover:bg-rose-500' : 'hover:bg-pink-500';
    
    return (
        <GlassCard className={`flex flex-col h-full hover:${activeColorStr} transition-colors cursor-pointer group relative overflow-hidden`} glow>
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="w-40 h-40" />
          </div>
          <div className="relative z-10 p-2 flex flex-col h-full">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bgColClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-7 h-7 ${textColClass}`} />
            </div>
            <h2 className="text-xl font-extrabold mb-2 text-white">{title}</h2>
            <p className="text-gray-400 text-sm flex-1 leading-relaxed mb-6">{desc}</p>
            <button onClick={() => {setActiveModal(id); setTopic("");}} className={`w-full py-3 mt-auto rounded-xl font-bold bg-${col}-500/10 ${textColClass} border border-${col}-500/30 ${hoverBgColClass} hover:text-white transition-all flex justify-between items-center px-4`}>
              <span className="text-sm">Start Practice</span>
              <BtnIcon className="w-4 h-4" />
            </button>
          </div>
        </GlassCard>
    );
  }

  return (
    <div className="space-y-8 relative pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-white">Full-Stack Practice Arena</h1>
        <p className="text-gray-400">Master every stage of your dream company's interview pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {renderModuleCard("language", Terminal, "pink", "Programming Languages", "Master Python, Java, C++, or JS basics from loops to OOPs concepts.", ChevronRight)}
          {renderModuleCard("code", Code, "blue", "Code IDE (DS & Algo)", "Write, debug, and execute advanced Data Structures and algorithms.", ChevronRight)}
          {renderModuleCard("sql", Table, "cyan", "SQL Query Arena", "Master complex table joins, aggregate window functions, and schema optimization queries.", ChevronRight)}
          {renderModuleCard("design", Server, "indigo", "System Design", "Draft macro-level architecture propositions for scalable web platforms.", ChevronRight)}
          {renderModuleCard("behavioral", Users, "rose", "Behavioral & HR", "Practice the STAR method for leadership, conflict, and HR scenario questions.", ChevronRight)}
          {renderModuleCard("cognitive", Brain, "purple", "Cognitive Puzzles", "Beat sequence finding, deductive reasoning, and grid-memory challenges (Capgemini Style).", ChevronRight)}
          {renderModuleCard("theory", Database, "green", "Core CS Theory", "Rapid-fire quizzes verifying Operating Systems, Networks, and Relational Databases.", ChevronRight)}
          {renderModuleCard("aptitude", Layers, "orange", "General Aptitude", "Mathematical, quant models, and basic logical reasoning numerical tests.", ChevronRight)}
      </div>

      {activeModal && !questionData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md w-full border-t-4 shadow-2xl relative border-t-primary">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-white/5 rounded-full p-1"><X className="w-5 h-5"/></button>
            <h2 className="text-2xl font-bold mb-6 text-white uppercase tracking-wider text-primary">Setup Simulation</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Choose Target Topic</label>
                <div className="relative">
                    <select className="w-full bg-[#121214] border border-white/10 rounded-xl p-4 pr-10 outline-none text-white appearance-none cursor-pointer"
                            value={topic} onChange={(e) => setTopic(e.target.value)}>
                        <option value="" disabled className="text-gray-500">Pick a specific subject area...</option>
                        {currentTopics.map((t: any, idx) => {
                            if (typeof t === 'string') {
                                return <option key={t} value={t} className="text-white bg-[#1a1a1c]">{t}</option>;
                            } else {
                                return (
                                    <optgroup key={idx} label={t.group} className="text-orange-500 font-extrabold uppercase tracking-widest mt-4">
                                        {t.topics.map((sub: string) => (
                                            <option key={sub} value={`${t.group}: ${sub}`} className="text-gray-300 bg-[#1a1a1c] font-medium pl-4 normal-case">
                                                {sub}
                                            </option>
                                        ))}
                                    </optgroup>
                                );
                            }
                        })}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Difficulty Scale</label>
                <div className="relative">
                    <select className="w-full bg-[#121214] border border-white/10 rounded-xl p-4 pr-10 outline-none text-white appearance-none cursor-pointer"
                            value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        <option className="text-white bg-[#1a1a1c]">Easy</option><option className="text-white bg-[#1a1a1c]">Medium</option><option className="text-white bg-[#1a1a1c]">Hard</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                </div>
              </div>
              {(activeModal === "language" || activeModal === "code") && (
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Programming Language</label>
                  <div className="relative">
                      <select className="w-full bg-[#121214] border border-white/10 rounded-xl p-4 pr-10 outline-none text-white appearance-none cursor-pointer"
                              value={language} onChange={(e) => setLanguage(e.target.value)}>
                          <option className="text-white bg-[#1a1a1c]" value="Python">Python</option>
                          <option className="text-white bg-[#1a1a1c]" value="Java">Java</option>
                          <option className="text-white bg-[#1a1a1c]" value="C++">C++</option>
                          <option className="text-white bg-[#1a1a1c]" value="JavaScript">JavaScript</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                  </div>
                </div>
              )}
              <button disabled={loading || !topic} onClick={() => handleGenerate(false)} 
                      className="w-full py-4 rounded-xl font-bold mt-2 disabled:opacity-50 text-white bg-primary hover:bg-primary/80 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <><Play className="w-4 h-4 fill-white"/> Generate Scenario</>}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {questionData && (
        <div className="fixed inset-0 bg-[#09090b] flex flex-col z-[100] h-screen w-screen overflow-hidden">
          {/* Top Navbar Menu */}
          <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between shrink-0 bg-[#0c0c0e]">
             <div className="flex items-center gap-4">
                 <button onClick={() => setQuestionData(null)} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                     <X className="w-4 h-4" /> Cancel Run
                 </button>
                 <div className="h-6 w-px bg-white/10"></div>
                 <div className="flex items-center gap-2">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest bg-white/10 text-gray-300`}>
                         {difficulty} • {activeModal}
                     </span>
                     <span className="text-gray-400 text-sm font-semibold">{topic}</span>
                 </div>
             </div>
             
             {isMcqMode && (
                <button onClick={() => completeTask(showAnswer)} className="px-5 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4"/> Submit Segment
                </button>
             )}
          </div>

          <div className={`flex-1 grid ${(isCodeMode || isTextMode) ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-4xl mx-auto w-full px-6 py-10'} h-[calc(100vh-64px)] overflow-hidden`}>
            
            {/* Left Side: Question Context */}
            <div className={`flex flex-col h-full overflow-y-auto ${(isCodeMode || isTextMode) ? 'border-r border-white/10 p-6 lg:p-10 hide-scrollbar' : ''}`}>
              <h2 className="text-3xl font-extrabold text-white mb-6 leading-tight">{questionData.title}</h2>
              
              <div className="prose prose-invert max-w-none text-gray-300 text-[15px] leading-relaxed mb-8">
                  {questionData.description}
              </div>
              
              {isCodeMode && questionData.constraints && questionData.constraints.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Constraints & Rules</h4>
                  <div className="bg-[#1e1e1e] border-l-4 border-blue-500 p-4 rounded-r-lg font-mono text-sm text-gray-300">
                    <ul className="list-disc list-inside space-y-1">
                      {questionData.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              )}
              
              {isCodeMode && questionData.sample_input && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Sample Input</h4>
                  <div className="bg-[#1e1e1e] p-4 rounded-lg font-mono text-sm text-blue-300 border border-white/5 break-all">
                    {typeof questionData.sample_input === 'object' ? JSON.stringify(questionData.sample_input, null, 2) : questionData.sample_input}
                  </div>
                </div>
              )}

              {/* Text Mode (Design/Behavioral) Setup logic */}
              {isTextMode && questionData.constraints && questionData.constraints.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Requirements</h4>
                  <div className="bg-[#1e1e1e] border-l-4 border-indigo-500 p-4 rounded-r-lg font-mono text-sm text-gray-300">
                    <ul className="list-disc list-inside space-y-1">
                      {questionData.constraints.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {/* MCQ specific logic */}
              {isMcqMode && questionData.options && (
                  <div className="space-y-4 mb-8">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Select your answer:</h4>
                      <div className="grid gap-3">
                          {questionData.options.map((opt: string, i: number) => {
                              const isSelected = selectedOption === opt;
                              const isCorrect = opt === questionData.correct_answer;
                              let borderClass = 'border-white/10 hover:border-gray-500/50';
                              let bgClass = 'bg-[#18181b] hover:bg-[#1f1f23] text-gray-300';
                              
                              if (showAnswer) {
                                  if (isCorrect) {
                                      borderClass = 'border-green-500';
                                      bgClass = 'bg-green-500/10 text-green-400 font-bold';
                                  } else if (isSelected) {
                                      borderClass = 'border-red-500';
                                      bgClass = 'bg-red-500/10 text-red-500';
                                  } else {
                                      borderClass = 'border-white/5 opacity-50';
                                  }
                              } else if (isSelected) {
                                  borderClass = 'border-primary';
                                  bgClass = 'bg-primary/10 text-primary';
                              }

                              return (
                                  <button 
                                      key={i} 
                                      onClick={() => !showAnswer && setSelectedOption(opt)}
                                      disabled={showAnswer}
                                      className={`p-4 rounded-xl border text-left transition-all duration-200 ${borderClass} ${bgClass}`}
                                  >
                                      {opt}
                                  </button>
                              );
                          })}
                      </div>
                      
                      {!showAnswer && (
                          <div className="pt-6">
                              <button 
                                  onClick={() => setShowAnswer(true)} 
                                  disabled={!selectedOption}
                                  className="w-full py-4 rounded-xl bg-primary text-black font-extrabold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                              >
                                  Verify Response
                              </button>
                          </div>
                      )}
                      
                      {showAnswer && (
                          <div className="mt-8 p-6 border border-white/10 bg-[#121214] rounded-xl relative overflow-hidden">
                              <div className={`absolute top-0 left-0 w-1 h-full ${selectedOption === questionData.correct_answer ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <h3 className="text-xl font-bold text-white mb-2">
                                  {selectedOption === questionData.correct_answer ? "Correct! Well done." : "Incorrect."}
                              </h3>
                              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2 mt-4">Logic Breakdown:</p>
                              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-black/20 p-4 border border-white/5 rounded-lg font-serif italic mt-2">{questionData.expected_logic}</div>
                              
                              <button onClick={() => handleGenerate(true)} disabled={nextLoading} className="mt-6 w-full py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 flex items-center justify-center gap-2">
                                  {nextLoading ? <Loader2 className="animate-spin w-5 h-5"/> : "Launch Next Question"}
                              </button>
                          </div>
                      )}
                  </div>
              )}

              {/* Solution/Expected Logic Toggle for Code & Text Modes */}
              {(isCodeMode || isTextMode) && (
                <div className="mt-auto pt-8">
                   <button onClick={() => setShowAnswer(!showAnswer)} className="text-gray-500 border border-white/10 bg-white/5 px-4 py-2 rounded-lg text-sm font-bold hover:text-white transition-colors">
                       {showAnswer ? "Hide Optimal Approach" : "Need a hint? View Expected Logic"}
                   </button>
                   {showAnswer && (
                       <div className="mt-4 p-5 border border-primary/20 bg-[#111113] rounded-xl shadow-lg">
                           <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{questionData.expected_logic}</div>
                       </div>
                   )}
                </div>
              )}
            </div>

            {/* Right Side: IDE or Text Editor */}
            {(isCodeMode || isTextMode) && (
              <div className="flex flex-col h-full bg-[#1e1e1e] relative">
                {/* Header */}
                <div className="flex justify-between items-center bg-[#2d2d2d] px-4 h-12 shrink-0 border-b border-[#111]">
                    <div className="flex items-center gap-3">
                        {isCodeMode ? <Code className="w-4 h-4 text-blue-400" /> : <MessageSquare className="w-4 h-4 text-indigo-400" />}
                        <span className="text-sm font-mono text-gray-300">{isCodeMode ? "main.py workspace" : "Drafting Board"}</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={tryAgain} className="text-gray-400 hover:text-white text-xs font-mono px-3 py-1 rounded bg-[#3e3e42] transition-colors">Clear</button>
                        <button onClick={runEvaluation} disabled={evalLoading} className="bg-primary hover:bg-primary/90 text-black px-4 py-1.5 rounded text-sm font-extrabold flex items-center gap-2 transition-colors disabled:opacity-50">
                            {evalLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Play className="w-3 h-3 fill-black"/>} {isCodeMode ? 'Run Execution' : 'Grade Submission'}
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative">
                    {/* Line numbers for code mode */}
                    {isCodeMode && (
                        <div className="absolute top-0 left-0 bottom-0 w-12 bg-[#2d2d2d] border-r border-[#404040] flex flex-col items-center py-4 text-[#858585] text-sm font-mono pointer-events-none z-10 overflow-hidden">
                            {[...Array(30)].map((_, i) => <div key={i}>{i + 1}</div>)}
                        </div>
                    )}
                    <textarea 
                        className={`w-full h-full bg-transparent text-[#d4d4d4] ${isCodeMode ? 'pl-16' : 'pl-6'} pr-4 py-4 ${isCodeMode ? 'font-mono' : 'font-sans text-lg'} focus:outline-none resize-none leading-relaxed z-0 relative`}
                        value={userResponse}
                        onChange={(e) => setUserResponse(e.target.value)}
                        placeholder={isTextMode ? "Write out your response here..." : ""}
                        spellCheck={!isCodeMode}
                        autoCorrect={isCodeMode ? "off" : "on"}
                    ></textarea>
                </div>

                {/* Output Terminal / Grader Plane */}
                <div className="h-64 shrink-0 bg-[#0d0d0f] border-t border-[#3c3c3c] flex flex-col relative z-20">
                    <div className="h-10 border-b border-white/5 flex items-center px-4 bg-[#151515]">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2"><Terminal className="w-4 h-4"/> AI Diagnostic Output</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] bg-transparent">
                        {!evalResult ? (
                            <div className="text-[#808080] italic">Awaiting submission. Press the action button to process your response logic.</div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Diagnosis: </span>
                                    <span className={`font-bold border px-2 py-0.5 rounded text-xs ${evalResult.status === 'Passed' ? 'text-[#4caf50] border-[#4caf50]' : 'text-[#f44336] border-[#f44336]'}`}>
                                        {evalResult.status}
                                    </span>
                                </div>
                                {(evalResult.output || !isTextMode) && (
                                    <div>
                                        <span className="text-gray-400">{isCodeMode ? "Output Trace:" : "Evaluation Summary:"}</span>
                                        <div className={`mt-1 pl-3 border-l-2 py-1 ${evalResult.status === 'Passed' ? 'border-[#4caf50]' : 'border-[#f44336]'} text-[#d4d4d4] whitespace-pre-wrap bg-white/5 rounded-r`}>
                                            {evalResult.output || "<No system output captured>"}
                                        </div>
                                    </div>
                                )}
                                <div className="text-[#3b82f6] text-sm bg-blue-500/10 p-3 rounded mt-2"><span className="text-blue-300 font-bold">Feedback Details:</span> {evalResult.feedback}</div>
                                
                                {evalResult.status === 'Passed' && (
                                    <div className="pt-4 flex gap-3">
                                        <button onClick={() => completeTask(true)} className="px-6 py-2 rounded bg-[#4caf50] text-[#1e1e1e] font-bold hover:bg-[#45a049] transition-colors shadow-lg shadow-green-500/20">Submit & Add XP</button>
                                        <button onClick={() => handleGenerate(true)} className="px-6 py-2 rounded bg-[#3a3a3a] text-white hover:bg-[#4a4a4a] transition-colors border border-[#555]">Proceed to Next</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
