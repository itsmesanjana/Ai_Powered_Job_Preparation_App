"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { User, Lock, Bell, Palette, Cpu, Sparkles, LogOut, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const mockSave = () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none z-[-1]"></div>

      <div>
        <h1 className="text-3xl font-bold mb-2">Platform Configuration</h1>
        <p className="text-gray-400">Manage your AI assessment parameters, UI preferences, and account security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Nav */}
        <div className="md:w-64 shrink-0 flex flex-col gap-2">
            <button onClick={() => setActiveTab("general")} className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <User className="w-5 h-5"/> Account Settings
            </button>
            <button onClick={() => setActiveTab("ai")} className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'ai' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <Cpu className="w-5 h-5"/> AI Evaluation Rules
            </button>
            <button onClick={() => setActiveTab("ui")} className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'ui' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <Palette className="w-5 h-5"/> Theme & Appearance
            </button>
            <button onClick={() => setActiveTab("notifications")} className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'notifications' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <Bell className="w-5 h-5"/> Notifications
            </button>
            <button onClick={() => setActiveTab("security")} className={`flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
                <Lock className="w-5 h-5"/> Security & Keys
            </button>
        </div>

        {/* Right Content */}
        <div className="flex-1">
            {activeTab === 'general' && (
                <GlassCard className="p-8" glow>
                    <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Profile Information</h3>
                    
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border-4 border-[#121214] shadow-[0_0_20px_rgba(139,92,246,0.3)]"></div>
                        <div>
                            <button className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-colors border border-white/10">Upload Avatar</button>
                            <p className="text-xs text-gray-500 mt-2">JPEG or PNG. Max 2MB.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                            <input disabled type="text" value="Developer Sandbox" className="w-full bg-[#151518] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary opacity-50 cursor-not-allowed" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                            <input disabled type="text" value="dev@prepai.system" className="w-full bg-[#151518] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary opacity-50 cursor-not-allowed" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <button className="px-8 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 mr-auto flex items-center gap-2 transition-colors">
                            <LogOut className="w-4 h-4"/> Sign Out Session
                        </button>
                        <button onClick={mockSave} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform flex items-center gap-2">
                            {saved ? <><CheckCircle2 className="w-5 h-5"/> Saved</> : 'Update Profile'}
                        </button>
                    </div>
                </GlassCard>
            )}

            {activeTab === 'ai' && (
                <GlassCard className="p-8" glow>
                    <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4 flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-primary"/> AI Assessment Parameters
                    </h3>

                    <div className="space-y-6">
                        <div className="bg-[#151518] p-6 rounded-2xl border border-white/10 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-white mb-1">Strict Mode Evaluation</h4>
                                <p className="text-xs text-gray-400 max-w-sm">When enabled, the AI will heavily penalize non-optimal code time/space complexity during final assessments.</p>
                            </div>
                            <div className="w-14 h-8 bg-primary rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                                <div className="w-6 h-6 bg-white rounded-full absolute top-1 right-1"></div>
                            </div>
                        </div>

                        <div className="bg-[#151518] p-6 rounded-2xl border border-white/10 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-white mb-1">Adaptive Prep Plans</h4>
                                <p className="text-xs text-gray-400 max-w-sm">Automatically restructure your curriculum roadmap based on your latest mock test failures.</p>
                            </div>
                            <div className="w-14 h-8 bg-primary rounded-full relative cursor-pointer">
                                <div className="w-6 h-6 bg-white rounded-full absolute top-1 right-1"></div>
                            </div>
                        </div>
                        
                        <div className="space-y-2 mt-6">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preferred Programming Language</label>
                            <select className="w-full bg-[#151518] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary appearance-none">
                                <option>Python 3.10+</option>
                                <option>JavaScript / TypeScript (Node.js)</option>
                                <option>C++ (GCC 11)</option>
                                <option>Java 17</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-8 border-t border-white/10 mt-8">
                        <button onClick={mockSave} className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                            {saved ? 'Settings Saved' : 'Apply AI Rules'}
                        </button>
                    </div>
                </GlassCard>
            )}

            {/* Other tabs mock state */}
            {['ui', 'notifications', 'security'].includes(activeTab) && (
                 <div className="flex h-64 flex-col items-center justify-center text-center">
                    <Lock className="w-12 h-12 text-gray-600 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Module Locked</h2>
                    <p className="text-gray-400 max-w-sm text-sm">This configuration module is hardcoded to its optimal state for the current PrepAI simulation baseline.</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
}
