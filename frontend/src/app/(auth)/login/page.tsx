"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }

      localStorage.setItem("token", data.access_token);
      
      // Navigate differently based on login vs register
      // If register, they probably need onboarding
      if (!isLogin) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8 relative overflow-hidden" glow>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
            <p className="text-gray-400">
              {isLogin ? "Log in to access your prep plan." : "Sign up to start your journey."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input 
                type="text" 
                required
                className="w-full bg-[#18181b] border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary text-white"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-[#18181b] border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary text-white"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>

            {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-primary text-white rounded-xl font-bold flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Login" : "Register")}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); }}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Register here" : "Login here"}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
