"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium neon-glow mb-8 mx-auto hover:bg-white/5 transition-colors cursor-pointer border-white/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>The next-generation AI hiring companion</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Master Your Next <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            Interview
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          AI mock interviews, resume analysis, and a personalized roadmap tailored for Scaler, FAANG, and top startups.
        </p>

        <div className="flex justify-center pt-8">
          <button onClick={() => {
            const token = localStorage.getItem("token");
            if (token) {
              window.location.href = "/dashboard";
            } else {
              window.location.href = "/login";
            }
          }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors text-lg group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </button>
        </div>
      </motion.div>
    </main>
  );
}
